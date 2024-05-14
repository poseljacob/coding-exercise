import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsDate,
  IsDecimal,
  IsBoolean,
} from 'class-validator';

// Base PurchaseOrder DTO
export class PurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  vendor_name: string;

  @IsNotEmpty()
  @Type(() => Date)
  order_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  expected_delivery_date: Date;

  @IsOptional()
  @IsBoolean()
  createInWMS?: boolean;
}

// Base LineItem DTO
export class LineItemDto {
  @IsNumber()
  item_id: number;

  @IsNumber()
  quantity: number;

  @IsDecimal()
  unit_cost: number;
}

// Create Operation DTO
export class CreatePurchaseOrderDto extends PurchaseOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  purchase_order_line_items: LineItemDto[];
}

// Extended LineItem DTO for Update and Delete
export class UpdateLineItemDto extends LineItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  @IsOptional()
  purchase_order_id?: number;

  @IsString()
  @IsOptional()
  action?: 'update' | 'delete' | 'new'; // Specify the action required
}

// Update Operation DTO for Purchase Orders
export class UpdatePurchaseOrderDto extends PurchaseOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLineItemDto)
  purchase_order_line_items: UpdateLineItemDto[];
}
