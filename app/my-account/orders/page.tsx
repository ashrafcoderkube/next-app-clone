import { Metadata } from 'next';
import Orders from '@/app/components/myaccountcomponents/Orders';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'View and manage your orders',
};

export default function OrdersPage() {
  return <Orders />
}
