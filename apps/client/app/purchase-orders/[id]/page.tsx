import { PurchaseOrder, ParentItem } from '../../types';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';

// Fetches a single purchase order by ID
async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const response = await fetch(
    `http://localhost:3100/api/purchase-orders/${id}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

// Fetches all parent items with their child items
async function getItems(): Promise<ParentItem[]> {
  const response = await fetch(`http://localhost:3100/api/parent-items`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

const Index = async ({ params }: { params: { id: string } }) => {
  const purchaseOrder = await getPurchaseOrder(params.id);
  const items = await getItems();

  return <PurchaseOrderForm initialOrder={purchaseOrder} items={items} />;
};

export default Index;
