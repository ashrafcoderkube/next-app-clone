import { Metadata } from 'next';
import UpdateAddressForm from '@/app/components/myaccountcomponents/UpdateAddressForm';

export const metadata: Metadata = {
  title: 'Address',
  description: 'View and manage your address',
};

export default function AddressPage() {
  return <UpdateAddressForm />
}