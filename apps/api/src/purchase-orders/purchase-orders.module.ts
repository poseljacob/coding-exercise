import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PrismaService } from '../prisma.service';
import { ShipheroService } from '../shiphero/shiphero.service';
import { PurchaseOrderCreatedHandler } from '../events/handlers/purchase-order-created.handler';
import { OpenAIService } from '../openai/openai.service';

@Module({
  imports: [CqrsModule],
  providers: [
    PurchaseOrdersService,
    PrismaService,
    ShipheroService,
    PurchaseOrderCreatedHandler,
    OpenAIService,
  ],
  controllers: [PurchaseOrdersController],
})
export class PurchaseOrdersModule {}
