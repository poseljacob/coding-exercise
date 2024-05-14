import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PurchaseOrderCreatedEvent } from '../purchase-order-created.event';
import { ShipheroService } from '../../shiphero/shiphero.service'; // Import your ShipHero service

// Handle the PurchaseOrderCreatedEvent
@EventsHandler(PurchaseOrderCreatedEvent)
export class PurchaseOrderCreatedHandler
  implements IEventHandler<PurchaseOrderCreatedEvent>
{
  constructor(private readonly shipHeroService: ShipheroService) {}

  async handle(event: PurchaseOrderCreatedEvent): Promise<void> {
    if (!event.createInWMS) return;
    await this.shipHeroService.createPurchaseOrder(event.purchaseOrderId);
  }
}
