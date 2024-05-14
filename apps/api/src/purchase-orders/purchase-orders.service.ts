import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../prisma.service';
import { PurchaseOrders, Prisma } from '@prisma/client';
import { PurchaseOrderCreatedEvent } from '../events/purchase-order-created.event';

import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdateLineItemDto,
} from './dto';
import { PaginationResult, PurchaseOrderWithTotals } from './interfaces';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Corrected import path

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService, private eventBus: EventBus) {}

  // Create a new purchase order and publish an event
  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrders> {
    const {
      purchase_order_line_items,
      vendor_name,
      order_date,
      expected_delivery_date,
      createInWMS,
    } = dto;

    try {
      const purchaseOrder = await this.prisma.purchaseOrders.create({
        data: {
          vendor_name,
          order_date,
          expected_delivery_date,
          purchase_order_line_items: {
            create: purchase_order_line_items,
          },
        },
      });

      // Publish an event to create the purchase order in ShipHero to adhere to SOLID principles
      this.eventBus.publish(
        new PurchaseOrderCreatedEvent(purchaseOrder.id, createInWMS)
      );
      return purchaseOrder;
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        // Duplicate entry error
        if (error.code === 'P2002') {
          throw new BadRequestException('Duplicate entry detected');
        }
        throw new BadRequestException('Invalid data provided');
      }
      console.error('Error creating purchase order:', error);
      throw new InternalServerErrorException('Failed to create purchase order');
    }
  }

  // Full update of a purchase order and its line items in a transaction
  async update(
    id: number,
    dto: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrders> {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await this.updatePurchaseOrderDetails(id, dto, transaction);
        if (dto.purchase_order_line_items) {
          await Promise.all(
            dto.purchase_order_line_items.map((item) =>
              this.handleLineItem(item, id, transaction)
            )
          );
        }
        return this.getPurchaseOrderWithItems(id, transaction);
      });
    } catch (error) {
      console.error('Error updating purchase order:', error);
      // Records not found error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException('Failed to update purchase order');
    }
  }

  // Delete a purchase order by ID
  async delete(id: number): Promise<void> {
    try {
      await this.prisma.purchaseOrders.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Records not found error
        if (error.code === 'P2025') {
          throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException('Failed to delete purchase order');
    }
  }

  // Get a single purchase order by ID
  async findOne(id: number): Promise<PurchaseOrders> {
    try {
      const order = await this.prisma.purchaseOrders.findUnique({
        where: { id },
        include: {
          purchase_order_line_items: true,
        },
      });
      if (!order) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found`);
      }
      return order;
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw new InternalServerErrorException('Failed to fetch purchase order');
    }
  }

  // TODO: https://github.com/prisma/prisma/issues/5079
  // Get all purchase orders with pagination, including aggregations of unit cost and quantity
  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult> {
    const skip = (page - 1) * limit;

    try {
      // Fetch purchase orders with pagination
      const purchaseOrders = await this.prisma.purchaseOrders.findMany({
        skip,
        take: limit,
        orderBy: {
          expected_delivery_date: 'asc',
        },
      });

      if (purchaseOrders.length === 0) {
        return {
          data: [],
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
        };
      }

      // Aggregate total quantity and unit cost for each purchase order in the database
      const totals = await this.prisma.purchaseOrderLineItems.groupBy({
        by: ['purchase_order_id'],
        _sum: {
          quantity: true,
          unit_cost: true,
        },
        having: {
          purchase_order_id: {
            in: purchaseOrders.map((po) => po.id),
          },
        },
      });

      // Combine purchase orders with totals
      const result: PurchaseOrderWithTotals[] = purchaseOrders.map((po) => {
        const total = totals.find((t) => t.purchase_order_id === po.id);
        return {
          ...po,
          totalQuantity: total?._sum.quantity || 0,
          totalUnitCost: total?._sum.unit_cost.toNumber(),
        };
      });

      // Calculate pagination details
      const totalRecords = await this.prisma.purchaseOrders.count();
      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;

      return {
        data: result,
        totalPages,
        currentPage: page,
        hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw new InternalServerErrorException('Failed to fetch purchase orders');
    }
  }

  // Update the purchase order
  private async updatePurchaseOrderDetails(
    id: number,
    data: UpdatePurchaseOrderDto,
    transaction: Prisma.TransactionClient
  ): Promise<PurchaseOrders> {
    const { vendor_name, order_date, expected_delivery_date } = data;
    return transaction.purchaseOrders.update({
      where: { id },
      data: {
        vendor_name,
        order_date,
        expected_delivery_date,
      },
    });
  }

  // Update the line items for a purchase order, including adding, updating, or deleting
  private async handleLineItem(
    item: UpdateLineItemDto,
    orderId: number,
    transaction: Prisma.TransactionClient
  ): Promise<void> {
    const { action, id, ...itemDetails } = item;
    switch (action) {
      case 'update':
        await transaction.purchaseOrderLineItems.update({
          where: { id },
          data: { ...itemDetails },
        });
        break;
      case 'new':
        await transaction.purchaseOrderLineItems.create({
          data: {
            ...itemDetails,
            purchase_order_id: orderId,
          },
        });
        break;
      case 'delete':
        await transaction.purchaseOrderLineItems.delete({
          where: { id },
        });
        break;
      default:
        console.warn(`Unknown action type: ${action}`);
    }
  }

  // Get a purchase order with its line items
  private async getPurchaseOrderWithItems(
    id: number,
    transaction: Prisma.TransactionClient
  ): Promise<PurchaseOrders> {
    const order = await transaction.purchaseOrders.findUnique({
      where: { id },
      include: { purchase_order_line_items: true },
    });
    if (!order) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return order;
  }
}
