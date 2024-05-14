import { PurchaseOrder, ParentItem } from '../../types';
import PurchaseOrderForm from '../../components/PurchaseOrderForm';

async function getItems(): Promise<ParentItem[]> {
  const response = await fetch(`http://localhost:3100/api/parent-items`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

const Index = async () => {
  const items = await getItems();

  return <PurchaseOrderForm isNewOrder={true} items={items} />;
};

export default Index;
