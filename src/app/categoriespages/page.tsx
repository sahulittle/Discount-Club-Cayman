import Header from '@/components/common/Header';
import { AutomativeMarine } from '@/app/categoriespages/components/AutomativeMarine';
import { B2BMembers } from '@/app/categoriespages/components/B2BMember';
import { BeautyBarber } from '@/app/categoriespages/components/BeautyBarber';
import { Construction } from '@/app/categoriespages/components/Construction';
import { Electronicsoffice } from '@/app/categoriespages/components/Electronicsoffice';
import { FashionClothing } from '@/app/categoriespages/components/Recreational';
import { FoodBeverage } from '@/app/categoriespages/components/FoodBeverage';
import { HealthFitness } from '@/app/categoriespages/components/HealthFitness';
import { HomeGarden } from '@/app/categoriespages/components/HomeGarden';
import { KidsFashion} from '@/app/categoriespages/components/KidsFashion';
import { Retail } from '@/app/categoriespages/components/Retail';
import { notFound } from 'next/navigation';

const categoryComponents: { [key: string]: React.ComponentType } = {
  'automotive-marine': AutomativeMarine,
  'b2b': B2BMembers,
  'beauty': BeautyBarber,
  'construction': Construction,
  'electronics': Electronicsoffice,
  'fashion': FashionClothing,
  'food': FoodBeverage,
  'health': HealthFitness,
  'home': HomeGarden,
  'kids': KidsFashion,
  'retail': Retail,
};

export default function SingleCategoryPage({ params }: { params: { category: string } }) {
  const CategoryComponent = categoryComponents[params.category];

  if (!CategoryComponent) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        <CategoryComponent />
      </main>
    </>
  );
}