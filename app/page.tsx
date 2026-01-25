'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductSelectionStepper from '@/components/ProductSelectionStepper';
import CategoryTiles from '@/components/CategoryTiles';
import FAQAccordion, { ContactModal } from '@/components/FAQAccordion';
import Footer from '@/components/Footer';

export default function Home() {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const router = useRouter();

  const handleProductSelectionClick = () => {
    const element = document.getElementById('product-selection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCategoriesClick = () => {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = useCallback(
    (categoryCode: string) => {
      router.push(`/product-lists?categoryCode=${encodeURIComponent(categoryCode)}`);
    },
    [router]
  );

  const handleContactClick = () => {
    setContactModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero
          onProductSelectionClick={handleProductSelectionClick}
          onExploreCategoriesClick={handleExploreCategoriesClick}
        />

        <ProductSelectionStepper />

        <CategoryTiles onCategorySelect={handleCategorySelect} />

        <FAQAccordion onContactClick={handleContactClick} />
      </main>

      <Footer />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}
