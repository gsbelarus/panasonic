'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductSelectionStepper from '@/components/ProductSelectionStepper';
import CategoryTiles from '@/components/CategoryTiles';
import FAQAccordion, { ContactModal } from '@/components/FAQAccordion';
import Footer from '@/components/Footer';

export default function Home() {
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>(undefined);
  const [contactModalOpen, setContactModalOpen] = useState(false);

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

  const handleCategorySelect = useCallback((category: string) => {
    setPreselectedCategory(category);
  }, []);

  const handleCategoryPreselected = useCallback(() => {
    // Clear the preselected category after it's been applied
    setPreselectedCategory(undefined);
  }, []);

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

        <ProductSelectionStepper
          preselectedCategory={preselectedCategory}
          onCategoryPreselected={handleCategoryPreselected}
        />

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
