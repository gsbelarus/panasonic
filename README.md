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

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
#########################################################################
#
# MongoDB Configuration
#
#########################################################################

# Credentials for the MongoDB user with database access
DB_SUPERADMIN_USER=        # Optional: MongoDB username (leave empty for local dev without auth)
DB_SUPERADMIN_PASSWORD=    # Optional: MongoDB password (leave empty for local dev without auth)

# MongoDB connection settings
DB_HOST=127.0.0.1          # MongoDB host (default: localhost)
DB_PORT=27017              # MongoDB port (default: 27017)
DB_NAME=panasonic          # Database name
```

**Note**: Never commit `.env.local` or any file containing secrets to version control.

### Database Setup

The application uses MongoDB for storing reference data. On first startup:

1. The database connection is established using the environment variables
2. Unique indexes are created for idempotent seeding:
   - `regions.code` (unique)
   - `countries.iso2` (unique)
   - `categories.code` (unique)
   - `subcategories.categoryCode + code` (compound unique)
3. Sort indexes are created for stable UI ordering:
   - `categories.sortOrder`
   - `subcategories.sortOrder`
4. If collections are empty, they are seeded with initial data

The seeding process is **idempotent** - it's safe to run multiple times without creating duplicates.

#### Collections

| Collection | Description | Fields |
|------------|-------------|--------|
| `regions` | Geographic regions | `code`, `name` |
| `countries` | Countries with regional association | `regionCode`, `iso2`, `name`, `voltage`, `frequency` |
| `categories` | Product categories | `code`, `name`, `icon`, `sortOrder` |
| `subcategories` | Product subcategories | `categoryCode`, `code`, `name`, `sortOrder` |
| `products` | Product catalog with market-specific specs | `modelCode`, `slug`, `categoryCode`, `subcategoryCode`, `highlights`, `marketSpecs`, `relatedModelCodes`, `assets`, `isActive` |

#### Products Collection Schema

The `products` collection stores ventilation product data with market-specific specifications:

```typescript
{
  _id: ObjectId,
  modelCode: string,           // Unique product identifier (e.g., "15AAQ1")
  slug: string,                // URL-friendly identifier (e.g., "15aaq1")
  categoryCode: string,        // Reference to categories collection
  subcategoryCode: string,     // Reference to subcategories collection
  categoryName?: string,       // Denormalized for UI convenience
  subcategoryName?: string,    // Denormalized for UI convenience
  highlights: string[],        // Marketing bullet points
  marketSpecs: [{              // Market-specific specifications
    regionCode: string,        // e.g., "AFRICA", "MIDDLE_EAST"
    countryName: string,       // e.g., "Sudan", "UAE"
    voltageV?: number,         // Electrical voltage
    frequencyHz?: number,      // Electrical frequency
    fanSpec: {
      powerConsumptionW?: number,
      fanSpeedRpm?: number,
      fanSubType?: string
    },
    construction: {
      ductSizeMm?: number,
      speedControl?: "Single" | "Double" | "Variable"
    },
    workingPoint: {
      speed?: string,
      airVolume: { min: number, max: number, unit: "CMH" },
      staticPressure: { min: number, max: number, unit: "Pa" },
      noise: { value: number, unit: "dBA" }
    },
    pqCurves?: [{              // PQ curve data for charting
      speed: string,
      dashStyle?: string,
      highlight?: boolean,
      points: [{ q: number, p: number }]
    }]
  }],
  relatedModelCodes: string[], // Related product model codes
  assets: {
    imageUrls: string[],
    documents: [{ label: string, url: string }]
  },
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
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
│   ├── api/
│   │   ├── regions/route.ts             # GET /api/regions - fetch all regions
│   │   ├── countries/route.ts           # GET /api/countries - fetch countries (optional ?regionCode filter)
│   │   ├── categories/route.ts          # GET /api/categories - fetch all categories
│   │   ├── subcategories/route.ts       # GET /api/subcategories - fetch subcategories (optional ?categoryCode filter)
│   │   └── products/
│   │       ├── route.ts                 # GET /api/products - fetch products with filters
│   │       └── [slug]/route.ts          # GET /api/products/:slug - fetch single product
│   ├── globals.css                      # Global styles and CSS variables
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Home page (main entry point)
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
├── hooks/
│   ├── useRegionsAndCountries.ts        # React hooks for fetching regions/countries
│   ├── useCategoriesAndSubcategories.ts # React hooks for fetching categories/subcategories
│   └── useProducts.ts                   # React hooks for fetching products
├── lib/
│   └── db/
│       ├── index.ts                     # Re-exports all db utilities
│       ├── connection.ts                # MongoDB connection singleton
│       ├── schemas.ts                   # Zod schemas and TypeScript types
│       └── seed.ts                      # Database seeding logic
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
