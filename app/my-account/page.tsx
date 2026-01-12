import { Metadata } from 'next';
import AccountDetails from '../components/myaccountcomponents/AccountDetails';

export const metadata: Metadata = {
  title: 'Account Details',
  description: 'Manage your account information and preferences',
};

export default function MyAccountPage() {
  return (
    <AccountDetails />
  );
}
