export class PurchaseOrderCreatedEvent {
  constructor(
    public readonly purchaseOrderId: number,
    public readonly createInWMS: boolean
  ) {}
}
