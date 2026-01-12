import { Metadata } from 'next';
import Wishlist from '@/app/components/myaccountcomponents/Wishlist';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'View and manage your wishlist items',
};

export default function WishlistPage() {
  return <Wishlist />
}
