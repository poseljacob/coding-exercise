import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  // Create a new purchase order
  @Post()
  createPurchaseOrder(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  // Update a purchase order
  @Put(':id')
  updatePurchaseOrder(
    @Param('id', ParseIntPipe) purchaseOrderId: number,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ) {
    return this.purchaseOrdersService.update(
      purchaseOrderId,
      updatePurchaseOrderDto
    );
  }

  // Get all purchase orders with pagination
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number
  ) {
    return this.purchaseOrdersService.findAll(page, limit);
  }

  // Get a single purchase order by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) purchaseOrderId: number) {
    return this.purchaseOrdersService.findOne(purchaseOrderId);
  }

  // Delete a purchase order
  @Delete(':id')
  deletePurchaseOrder(@Param('id', ParseIntPipe) purchaseOrderId: number) {
    return this.purchaseOrdersService.delete(purchaseOrderId);
  }
}
