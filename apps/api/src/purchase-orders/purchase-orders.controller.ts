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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchaseOrdersService } from './purchase-orders.service';
import { OpenAIService } from '../openai/openai.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';
import { Multer } from 'multer';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly openAIService: OpenAIService
  ) {}

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

  @Post('/convert-file')
  @UseInterceptors(
    // Intercepted file upload would ideally be stored in a cloud storage like S3, if saved at all
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    })
  )
  handleUpload(@UploadedFile() file: Express.Multer.File) {
    return this.openAIService.convertFile(file);
  }
}
