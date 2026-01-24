'use client';

import { useState } from 'react';
import Modal from './Modal';

interface FAQAccordionProps {
  onContactClick: () => void;
}

const faqItems = [
  {
    question: 'What is a ventilation fan?',
    answer:
      'A ventilation fan is a mechanical device designed to move air from one place to another. It helps improve indoor air quality by removing stale air, moisture, odors, and pollutants while bringing in fresh air from outside. Ventilation fans come in various types including exhaust fans, supply fans, and balanced ventilation systems.',
  },
  {
    question: 'Why is ventilation important?',
    answer:
      'Proper ventilation is crucial for maintaining healthy indoor air quality. It helps control humidity levels, prevents mold and mildew growth, removes indoor air pollutants, and ensures adequate oxygen supply. Good ventilation also helps regulate temperature, reduces condensation, and can significantly improve comfort and well-being in both residential and commercial spaces.',
  },
  {
    question: 'What are the types of ventilation fans?',
    answer:
      'There are several types of ventilation fans: 1) Wall-mounted fans for direct exhaust through walls, 2) Ceiling-mounted fans for bathroom and kitchen ventilation, 3) Window-mounted fans for reversible airflow, 4) In-line/duct fans for ducted ventilation systems, 5) Industrial fans for large-scale commercial applications, and 6) Cabinet fans for enclosed spaces. Each type is designed for specific applications and environments.',
  },
  {
    question: 'What is ventilation fan selection software?',
    answer:
      'Ventilation fan selection software is a specialized tool that helps engineers, architects, and contractors choose the right ventilation fan for their specific requirements. It considers factors like room size, air volume requirements, static pressure, voltage compatibility, and environmental conditions to recommend suitable fan models that meet performance and efficiency criteria.',
  },
  {
    question: 'Who can use fan selection software?',
    answer:
      'Fan selection software can be used by a wide range of professionals including HVAC engineers, architects, building contractors, facility managers, and even homeowners planning renovation projects. The software is designed to be user-friendly while providing technical accuracy, making it accessible to both professionals and those with basic technical knowledge.',
  },
  {
    question: 'Why is fan selection software important?',
    answer:
      'Fan selection software is important because it ensures optimal ventilation system design. Selecting the wrong fan can lead to inadequate ventilation, excessive energy consumption, noise problems, or premature equipment failure. The software helps avoid these issues by matching fan specifications precisely to application requirements, resulting in better performance, energy efficiency, and cost savings.',
  },
];

export default function FAQAccordion({ onContactClick }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Contact */}
          <div className="lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Can&apos;t find the answer you&apos;re looking for? Please contact with us.
            </p>
            <button
              type="button"
              onClick={onContactClick}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Contact us
            </button>
          </div>

          {/* Right column - FAQ Accordion */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-[var(--border)] rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                    aria-expanded={openIndex === index}
                  >
                    <span className="text-sm font-medium text-[var(--foreground)] pr-4">
                      {item.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-[var(--muted)] flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'
                      }`}
                  >
                    <div className="px-5 pb-4 pt-1">
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Us"
      description="Get in touch with our team for support and inquiries."
      titleId="contact-modal-title"
      descriptionId="contact-modal-desc"
    >
      <div className="space-y-4">
        <div className="bg-[var(--secondary)] rounded-lg p-4">
          <h4 className="font-medium text-[var(--foreground)] mb-2">
            Customer Support
          </h4>
          <p className="text-sm text-[var(--muted)]">
            For product inquiries and technical support:
          </p>
          <a
            href="mailto:support@kdk-ventilation.com"
            className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block"
          >
            support@kdk-ventilation.com
          </a>
        </div>
        <div className="bg-[var(--secondary)] rounded-lg p-4">
          <h4 className="font-medium text-[var(--foreground)] mb-2">
            Sales Inquiries
          </h4>
          <p className="text-sm text-[var(--muted)]">
            For pricing and ordering information:
          </p>
          <a
            href="mailto:sales@kdk-ventilation.com"
            className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block"
          >
            sales@kdk-ventilation.com
          </a>
        </div>
        <div className="bg-[var(--secondary)] rounded-lg p-4">
          <h4 className="font-medium text-[var(--foreground)] mb-2">
            Phone Support
          </h4>
          <p className="text-sm text-[var(--muted)]">
            Monday - Friday, 9:00 AM - 6:00 PM
          </p>
          <p className="text-sm text-[var(--primary)] mt-1">+1 (800) 123-4567</p>
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
