import Header from '@/components/common/Header';
import Link from 'next/link';
import { AutomativeMarine } from './components/Automative&Marine';
import { B2BMembers } from './components/B2BMembers';
import { BeautyBarber } from './components/Beauty&Barber';
import { Construction } from './components/Construction';
import { Electronicsoffice } from './components/Electronics&office';
import { FashionClothing } from './components/Fashion&Clothing';
import { FinacialInstitutes } from './components/FinacialInstitutes';
import { FoodBeverage } from './components/Food&Beverage';
import { HealthFitness } from './components/Health&Fitness';
import { HomeGarden } from './components/Home&Garden';
import { KidsRecreational } from './components/Kids&Recreational';
import { MarketingMedia } from './components/Marketing&Media';
import { Retail } from './components/Retail';

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <AutomativeMarine />
        <B2BMembers/>
        <BeautyBarber/>
        <Construction/>
        <Electronicsoffice/>
        <FashionClothing/>
        <FinacialInstitutes/>
        <FoodBeverage/>
        <HealthFitness/>
        <HomeGarden/>
        <KidsRecreational/>
        <MarketingMedia/>
        <Retail/>
      </main>
    </>
  );
}