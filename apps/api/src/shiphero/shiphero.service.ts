import { Injectable } from '@nestjs/common';
import { PurchaseOrders } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShipheroService {
  constructor(private prisma: PrismaService) {}

  async createPurchaseOrder(purchaseOrderId: number) {
    const purchaseOrder = await this.getPurchaseOrder(purchaseOrderId);
    const query = await this.generateShipHeroQuery(purchaseOrder);
    const response = await this.sendShipHeroQuery(query);
    // console error if response is not successful

    // Log response from ShipHero

    // Call ShipHero API to create purchase order
    console.log('Creating purchase order in ShipHero:', purchaseOrder);

    // Purchase order id from ShipHero response

    // Update purchase order with ShipHero purchase order id
  }

  // Get purchase order by id
  private async getPurchaseOrder(
    purchaseOrderId: number
  ): Promise<PurchaseOrders> {
    return this.prisma.purchaseOrders.findUnique({
      where: { id: purchaseOrderId },
      include: { purchase_order_line_items: true },
    });
  }

  private async generateShipHeroQuery(purchaseOrder: PurchaseOrders) {
    // Generate query to create purchase order in ShipHero
  }

  private async sendShipHeroQuery(query: any) {
    // Send query to ShipHero API
  }
}
