import { Suspense } from 'react';
import ShopClient from './ShopClient';
import Loader from '../components/customcomponents/Loader';

// Server Component - handles initial data fetching and layout
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="lg:col-span-10 flex justify-center">
      <Loader height="h-[50vh]" />
    </div>}>
      <ShopClient />
    </Suspense>
  );
}