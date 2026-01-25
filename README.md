# KDK Ventilation Product Selection Tool

A Next.js (App Router) TypeScript application for selecting ventilation products. This single-page application provides a marketing + configurator hybrid experience with a multi-step selector form, engineering calculator modals, category exploration grid, and FAQ section.

## Features

- **Hero Section**: Introduction with quick-access cards to the product selector and category browser
- **Product Selection Stepper**: 4-step form for selecting ventilation products
  - Step 1: Region and Country selection
  - Step 2: Product Category and Subcategory
  - Step 3: Voltage and Frequency (auto-populated based on country)
  - Step 4: Air Volume and Static Pressure with calculator modals
- **Calculator Modals**: Engineering calculators for Air Volume and Static Pressure
- **Category Tiles**: Grid of product categories for easy browsing
- **FAQ Accordion**: Common questions with expandable answers
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop

## Tech Stack

- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS 4
- React 19

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
# or
npm install
# or
yarn install
```

### Development

```bash
# Run the development server
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
# Build the application
pnpm build
# or
npm run build

# Start the production server
pnpm start
# or
npm start
```

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles and CSS variables
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page (main entry point)
├── components/
│   ├── Header.tsx                       # Navigation header
│   ├── Hero.tsx                         # Hero/introduction section
│   ├── ProductSelectionStepper.tsx      # 4-step product selection form
│   ├── CategoryTiles.tsx                # Product category grid
│   ├── FAQAccordion.tsx                 # FAQ section with accordion
│   ├── Footer.tsx                       # Page footer
│   ├── Modal.tsx                        # Base modal component with accessibility
│   ├── ConfirmModal.tsx                 # Confirmation dialog modal
│   ├── AirVolumeCalculatorModal.tsx     # Air volume calculator
│   ├── StaticPressureCalculatorModal.tsx # Static pressure calculator
│   └── ResultsBanner.tsx                # Search results banner
├── public/                              # Static assets
└── package.json
```

## Accessibility Features

- Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- All form inputs have associated labels
- Modals include:
  - Focus trapping
  - Escape key to close
  - `aria-labelledby` and `aria-describedby` attributes
  - Backdrop click to close
- Keyboard navigation support

## License

This project is for demonstration purposes.
