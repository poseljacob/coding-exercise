import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PrismaService } from '../prisma.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';
import { PurchaseOrders } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let prisma: PrismaService;

  const mockPurchaseOrders = {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  const mockPurchaseOrderLineItems = {
    groupBy: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    purchaseOrders: mockPurchaseOrders,
    purchaseOrderLineItems: mockPurchaseOrderLineItems,
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockModuleRef = {
    get: jest.fn(),
  };

  const mockUnhandledExceptionBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventBus, useValue: mockEventBus },
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: ModuleRef, useValue: mockModuleRef },
        {
          provide: 'UnhandledExceptionBus',
          useValue: mockUnhandledExceptionBus,
        },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new purchase order', async () => {
      const createDto: CreatePurchaseOrderDto = {
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        purchase_order_line_items: [],
      };

      const createdOrder: PurchaseOrders = {
        id: 1,
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPurchaseOrders.create.mockResolvedValue(createdOrder);

      await expect(service.create(createDto)).resolves.toEqual(createdOrder);
      expect(mockPurchaseOrders.create).toHaveBeenCalledWith({
        data: {
          vendor_name: createDto.vendor_name,
          order_date: createDto.order_date,
          expected_delivery_date: createDto.expected_delivery_date,
          purchase_order_line_items: {
            create: createDto.purchase_order_line_items,
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update a purchase order', async () => {
      const updateDto: UpdatePurchaseOrderDto = {
        vendor_name: 'Vendor Updated',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        purchase_order_line_items: [],
      };

      const updatedOrder: PurchaseOrders = {
        id: 1,
        vendor_name: 'Vendor Updated',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return fn({
          purchaseOrders: {
            update: mockPurchaseOrders.update,
            findUnique: mockPurchaseOrders.findUnique,
          },
        });
      });
      mockPurchaseOrders.update.mockResolvedValue(updatedOrder);
      mockPurchaseOrders.findUnique.mockResolvedValue(updatedOrder);

      await expect(service.update(1, updateDto)).resolves.toEqual(updatedOrder);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPurchaseOrders.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          vendor_name: updateDto.vendor_name,
          order_date: updateDto.order_date,
          expected_delivery_date: updateDto.expected_delivery_date,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find a purchase order by ID', async () => {
      const order: PurchaseOrders = {
        id: 1,
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPurchaseOrders.findUnique.mockResolvedValue(order);

      await expect(service.findOne(1)).resolves.toEqual(order);
      expect(mockPurchaseOrders.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          purchase_order_line_items: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should find all purchase orders with pagination', async () => {
      const orders: PurchaseOrders[] = [
        {
          id: 1,
          vendor_name: 'Vendor 1',
          order_date: new Date(),
          expected_delivery_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          vendor_name: 'Vendor 2',
          order_date: new Date(),
          expected_delivery_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const totals = [
        {
          purchase_order_id: 1,
          _sum: {
            quantity: 10,
            unit_cost: new Decimal(100),
          },
        },
        {
          purchase_order_id: 2,
          _sum: {
            quantity: 20,
            unit_cost: new Decimal(200),
          },
        },
      ];

      const totalRecords = orders.length;

      mockPurchaseOrders.findMany.mockResolvedValue(orders);
      mockPurchaseOrderLineItems.groupBy.mockResolvedValue(totals);
      mockPurchaseOrders.count.mockResolvedValue(totalRecords);

      const page = 1;
      const limit = 10;

      const expectedResult = {
        data: [
          {
            ...orders[0],
            totalQuantity: totals[0]._sum.quantity,
            totalUnitCost: totals[0]._sum.unit_cost.toNumber(),
          },
          {
            ...orders[1],
            totalQuantity: totals[1]._sum.quantity,
            totalUnitCost: totals[1]._sum.unit_cost.toNumber(),
          },
        ],
        totalPages: 1,
        currentPage: page,
        hasNextPage: false,
      };

      await expect(service.findAll(page, limit)).resolves.toEqual(
        expectedResult
      );
      expect(mockPurchaseOrders.findMany).toHaveBeenCalledWith({
        orderBy: {
          expected_delivery_date: 'asc',
        },
        skip: 0,
        take: limit,
      });
      expect(mockPurchaseOrderLineItems.groupBy).toHaveBeenCalledWith({
        by: ['purchase_order_id'],
        _sum: {
          quantity: true,
          unit_cost: true,
        },
        having: {
          purchase_order_id: {
            in: orders.map((po) => po.id),
          },
        },
      });
      expect(mockPurchaseOrders.count).toHaveBeenCalled();
    });
  });
});
