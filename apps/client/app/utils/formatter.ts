import { Item, ParentItem } from '../types';

// format date in YYYY-MM-DD format taking in a date string
export const formatDate = (date: string): string => {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  return new Date(date).toISOString().split('T')[0];
};

// flatten parent items into a single array of items
export const flattenItems = (parentItems: ParentItem[]): Item[] => {
  return parentItems.reduce(
    (acc: Item[], parentItem: ParentItem) => [...acc, ...parentItem.items],
    []
  );
};
