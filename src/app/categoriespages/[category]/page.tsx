import Header from '@/components/common/Header';
import { AutomativeMarine } from '../components/AutomativeMarine';
import { B2BMembers } from '../components/B2BMember';
import { BeautyBarber } from '../components/BeautyBarber';
import { Construction } from '../components/Construction';
import { Electronicsoffice } from '../components/Electronicsoffice';
import { FashionClothing } from '../components/FashionClothing';
import { FinacialInstitutes } from '../components/FinacialInstitutes';
import { FoodBeverage } from '../components/FoodBeverage';
import { HealthFitness } from '../components/HealthFitness';
import { HomeGarden } from '../components/HomeGarden';
import { KidsRecreational } from '../components/KidsRecreational';
import { MarketingMedia } from '../components/MarketingMedia';
import { Retail } from '../components/Retail';
import { notFound } from 'next/navigation';

const categoryComponents: { [key: string]: React.ComponentType } = {
  'automotive-marine': AutomativeMarine,
  'b2b': B2BMembers,
  'beauty': BeautyBarber,
  'construction': Construction,
  'electronics': Electronicsoffice,
  'fashion': FashionClothing,
  'financial': FinacialInstitutes,
  'food': FoodBeverage,
  'health': HealthFitness,
  'home': HomeGarden,
  'kids': KidsRecreational,
  'marketing': MarketingMedia,
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
