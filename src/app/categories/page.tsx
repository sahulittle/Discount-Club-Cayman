import Header from '@/components/common/Header';
import Categories from './component/Categories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | Discount Club Cayman',
  description: 'This page is a directory. Please select a category to view the available discounts and offers.',
  robots: {
    index: false, // We don't want search engines to index this placeholder page
  }
};

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <Categories />
    </>
  );
}