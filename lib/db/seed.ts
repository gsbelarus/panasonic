import { connectToDatabase, COLLECTIONS } from './connection';
import type { CreateRegion, CreateCountry, CreateCategory, CreateSubcategory, CreateStore } from './schemas';
import { validateCreateRegion, validateCreateCountry, validateCreateCategory, validateCreateSubcategory, validateCreateStore } from './schemas';
import { createProductsIndexes } from './products/indexes';
import { bootstrapProducts } from './products/seed';

// ============================================================================
// Seed Data - Extracted from existing hardcoded values
// ============================================================================

/**
 * Initial regions data matching the existing regionCountries keys
 */
const SEED_REGIONS: CreateRegion[] = [
  { code: 'africa', name: 'Africa' },
  { code: 'middle-east', name: 'Middle East' },
];

/**
 * Initial countries data matching the existing regionCountries and countryDefaults
 */
const SEED_COUNTRIES: CreateCountry[] = [
  // Africa
  { iso2: 'EG', name: 'Egypt', regionCode: 'africa', voltage: '220V', frequency: '50Hz' },
  { iso2: 'KE', name: 'Kenya', regionCode: 'africa', voltage: '240V', frequency: '50Hz' },
  { iso2: 'NG', name: 'Nigeria', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'ZA', name: 'South Africa', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'MA', name: 'Morocco', regionCode: 'africa', voltage: '220V', frequency: '50Hz' },
  { iso2: 'TZ', name: 'Tanzania', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'GH', name: 'Ghana', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },

  // Middle East
  { iso2: 'AE', name: 'United Arab Emirates', regionCode: 'middle-east', voltage: '220V', frequency: '50Hz' },
  { iso2: 'SA', name: 'Saudi Arabia', regionCode: 'middle-east', voltage: '220V', frequency: '60Hz' },
  { iso2: 'QA', name: 'Qatar', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'KW', name: 'Kuwait', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'BH', name: 'Bahrain', regionCode: 'middle-east', voltage: '230V', frequency: '50Hz' },
  { iso2: 'OM', name: 'Oman', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'JO', name: 'Jordan', regionCode: 'middle-east', voltage: '230V', frequency: '50Hz' },
];

/**
 * Initial categories data matching the existing categories array
 */
const SEED_CATEGORIES: CreateCategory[] = [
  { code: 'cabinet-fan', name: 'Cabinet Fan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', sortOrder: 0 },
  { code: 'ceiling-mount', name: 'Ceiling Mount', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', sortOrder: 1 },
  { code: 'in-line-centrifugal-fan', name: 'In-line Centrifugal Fan', icon: 'M13 10V3L4 14h7v7l9-11h-7z', sortOrder: 2 },
  { code: 'industrial-fan', name: 'Industrial Fan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', sortOrder: 3 },
  { code: 'mini-sirocco', name: 'Mini Sirocco', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', sortOrder: 4 },
  { code: 'thermo-vent', name: 'Thermo Vent', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', sortOrder: 5 },
  { code: 'wall-mount', name: 'Wall Mount', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2', sortOrder: 6 },
  { code: 'window-mount', name: 'Window Mount', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', sortOrder: 7 },
  { code: 'accessories', name: 'Accessories', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', sortOrder: 8 },
];

/**
 * Initial subcategories data matching the existing categorySubcategories
 */
const SEED_SUBCATEGORIES: CreateSubcategory[] = [
  // Cabinet Fan
  { code: 'standard', name: 'Standard', categoryCode: 'cabinet-fan', sortOrder: 0 },
  { code: 'heavy-duty', name: 'Heavy Duty', categoryCode: 'cabinet-fan', sortOrder: 1 },
  { code: 'compact', name: 'Compact', categoryCode: 'cabinet-fan', sortOrder: 2 },

  // Ceiling Mount
  { code: 'flush-mount', name: 'Flush Mount', categoryCode: 'ceiling-mount', sortOrder: 0 },
  { code: 'duct-connect', name: 'Duct Connect', categoryCode: 'ceiling-mount', sortOrder: 1 },
  { code: 'decorative', name: 'Decorative', categoryCode: 'ceiling-mount', sortOrder: 2 },

  // In-line Centrifugal Fan
  { code: 'low-profile', name: 'Low Profile', categoryCode: 'in-line-centrifugal-fan', sortOrder: 0 },
  { code: 'high-pressure', name: 'High Pressure', categoryCode: 'in-line-centrifugal-fan', sortOrder: 1 },
  { code: 'mixed-flow', name: 'Mixed Flow', categoryCode: 'in-line-centrifugal-fan', sortOrder: 2 },

  // Industrial Fan
  { code: 'axial', name: 'Axial', categoryCode: 'industrial-fan', sortOrder: 0 },
  { code: 'centrifugal', name: 'Centrifugal', categoryCode: 'industrial-fan', sortOrder: 1 },
  { code: 'propeller', name: 'Propeller', categoryCode: 'industrial-fan', sortOrder: 2 },

  // Mini Sirocco
  { code: 'mini-standard', name: 'Standard', categoryCode: 'mini-sirocco', sortOrder: 0 },
  { code: 'low-noise', name: 'Low Noise', categoryCode: 'mini-sirocco', sortOrder: 1 },
  { code: 'high-flow', name: 'High Flow', categoryCode: 'mini-sirocco', sortOrder: 2 },

  // Thermo Vent
  { code: 'basic', name: 'Basic', categoryCode: 'thermo-vent', sortOrder: 0 },
  { code: 'with-timer', name: 'With Timer', categoryCode: 'thermo-vent', sortOrder: 1 },
  { code: 'with-humidity-sensor', name: 'With Humidity Sensor', categoryCode: 'thermo-vent', sortOrder: 2 },

  // Wall Mount
  { code: 'wall-standard', name: 'Standard', categoryCode: 'wall-mount', sortOrder: 0 },
  { code: 'with-shutter', name: 'With Shutter', categoryCode: 'wall-mount', sortOrder: 1 },
  { code: 'with-light', name: 'With Light', categoryCode: 'wall-mount', sortOrder: 2 },

  // Window Mount
  { code: 'reversible', name: 'Reversible', categoryCode: 'window-mount', sortOrder: 0 },
  { code: 'exhaust-only', name: 'Exhaust Only', categoryCode: 'window-mount', sortOrder: 1 },
  { code: 'with-remote', name: 'With Remote', categoryCode: 'window-mount', sortOrder: 2 },

  // Accessories
  { code: 'grilles', name: 'Grilles', categoryCode: 'accessories', sortOrder: 0 },
  { code: 'ducting', name: 'Ducting', categoryCode: 'accessories', sortOrder: 1 },
  { code: 'controls', name: 'Controls', categoryCode: 'accessories', sortOrder: 2 },
];

/**
 * Initial stores data - 2-3 stores per country
 * Each store has realistic mocked data with proper referential integrity
 */
const SEED_STORES: Omit<CreateStore, 'isActive'>[] = [
  // ========== AFRICA ==========
  // Egypt (EG)
  {
    regionCode: 'africa',
    countryIso2: 'EG',
    countryRegion: 'Cairo Governorate',
    city: 'Cairo',
    name: 'Cairo Electronics Hub',
    phones: ['+20 2 2345 6789'],
    location: { lat: 30.0444, lng: 31.2357 },
    geo: { type: 'Point', coordinates: [31.2357, 30.0444] },
    addressLine1: '123 Tahrir Square, Downtown',
  },
  {
    regionCode: 'africa',
    countryIso2: 'EG',
    countryRegion: 'Alexandria Governorate',
    city: 'Alexandria',
    name: 'Alexandria Ventilation Center',
    phones: ['+20 3 4567 8901', '+20 3 4567 8902'],
    location: { lat: 31.2001, lng: 29.9187 },
    geo: { type: 'Point', coordinates: [29.9187, 31.2001] },
    addressLine1: '45 Corniche Road',
  },

  // Kenya (KE)
  {
    regionCode: 'africa',
    countryIso2: 'KE',
    countryRegion: 'Nairobi County',
    city: 'Nairobi',
    name: 'Nairobi Air Systems',
    phones: ['+254 20 234 5678'],
    location: { lat: -1.2921, lng: 36.8219 },
    geo: { type: 'Point', coordinates: [36.8219, -1.2921] },
    addressLine1: 'Westlands Business Park',
  },
  {
    regionCode: 'africa',
    countryIso2: 'KE',
    countryRegion: 'Mombasa County',
    city: 'Mombasa',
    name: 'Coastal Ventilation Solutions',
    phones: ['+254 41 234 5678'],
    location: { lat: -4.0435, lng: 39.6682 },
    geo: { type: 'Point', coordinates: [39.6682, -4.0435] },
    addressLine1: 'Nyali Bridge Road',
  },

  // Nigeria (NG)
  {
    regionCode: 'africa',
    countryIso2: 'NG',
    countryRegion: 'Lagos State',
    city: 'Lagos',
    name: 'Lagos Fan & Cooling Center',
    phones: ['+234 1 234 5678', '+234 1 234 5679'],
    location: { lat: 6.5244, lng: 3.3792 },
    geo: { type: 'Point', coordinates: [3.3792, 6.5244] },
    addressLine1: 'Victoria Island',
  },
  {
    regionCode: 'africa',
    countryIso2: 'NG',
    countryRegion: 'Abuja FCT',
    city: 'Abuja',
    name: 'Capital Air Solutions',
    phones: ['+234 9 876 5432'],
    location: { lat: 9.0765, lng: 7.3986 },
    geo: { type: 'Point', coordinates: [7.3986, 9.0765] },
    addressLine1: 'Wuse Zone 5',
  },
  {
    regionCode: 'africa',
    countryIso2: 'NG',
    countryRegion: 'Rivers State',
    city: 'Port Harcourt',
    name: 'Port Harcourt Industrial Fans',
    phones: ['+234 84 234 567'],
    location: { lat: 4.8156, lng: 7.0498 },
    geo: { type: 'Point', coordinates: [7.0498, 4.8156] },
    addressLine1: 'Trans Amadi Industrial Layout',
  },

  // South Africa (ZA)
  {
    regionCode: 'africa',
    countryIso2: 'ZA',
    countryRegion: 'Gauteng',
    city: 'Johannesburg',
    name: 'Joburg Ventilation Warehouse',
    phones: ['+27 11 234 5678'],
    location: { lat: -26.2041, lng: 28.0473 },
    geo: { type: 'Point', coordinates: [28.0473, -26.2041] },
    addressLine1: 'Sandton City Mall',
  },
  {
    regionCode: 'africa',
    countryIso2: 'ZA',
    countryRegion: 'Western Cape',
    city: 'Cape Town',
    name: 'Cape Cooling Systems',
    phones: ['+27 21 456 7890'],
    location: { lat: -33.9249, lng: 18.4241 },
    geo: { type: 'Point', coordinates: [18.4241, -33.9249] },
    addressLine1: 'V&A Waterfront',
  },

  // Morocco (MA)
  {
    regionCode: 'africa',
    countryIso2: 'MA',
    countryRegion: 'Casablanca-Settat',
    city: 'Casablanca',
    name: 'Casablanca Air Tech',
    phones: ['+212 522 234 567'],
    location: { lat: 33.5731, lng: -7.5898 },
    geo: { type: 'Point', coordinates: [-7.5898, 33.5731] },
    addressLine1: 'Boulevard Mohammed V',
  },
  {
    regionCode: 'africa',
    countryIso2: 'MA',
    countryRegion: 'Rabat-Salé-Kénitra',
    city: 'Rabat',
    name: 'Royal Ventilation Center',
    phones: ['+212 537 345 678'],
    location: { lat: 34.0209, lng: -6.8416 },
    geo: { type: 'Point', coordinates: [-6.8416, 34.0209] },
    addressLine1: 'Avenue Hassan II',
  },

  // Tanzania (TZ)
  {
    regionCode: 'africa',
    countryIso2: 'TZ',
    countryRegion: 'Dar es Salaam',
    city: 'Dar es Salaam',
    name: 'Dar Air Solutions',
    phones: ['+255 22 234 5678'],
    location: { lat: -6.7924, lng: 39.2083 },
    geo: { type: 'Point', coordinates: [39.2083, -6.7924] },
    addressLine1: 'Kariakoo Market Area',
  },
  {
    regionCode: 'africa',
    countryIso2: 'TZ',
    countryRegion: 'Arusha',
    city: 'Arusha',
    name: 'Arusha Ventilation Store',
    phones: ['+255 27 234 5678'],
    location: { lat: -3.3869, lng: 36.6830 },
    geo: { type: 'Point', coordinates: [36.6830, -3.3869] },
    addressLine1: 'Sokoine Road',
  },

  // Ghana (GH)
  {
    regionCode: 'africa',
    countryIso2: 'GH',
    countryRegion: 'Greater Accra',
    city: 'Accra',
    name: 'Accra Fan & Air Center',
    phones: ['+233 30 234 5678'],
    location: { lat: 5.6037, lng: -0.1870 },
    geo: { type: 'Point', coordinates: [-0.1870, 5.6037] },
    addressLine1: 'Osu Oxford Street',
  },
  {
    regionCode: 'africa',
    countryIso2: 'GH',
    countryRegion: 'Ashanti',
    city: 'Kumasi',
    name: 'Kumasi Industrial Fans',
    phones: ['+233 32 345 6789'],
    location: { lat: 6.6884, lng: -1.6244 },
    geo: { type: 'Point', coordinates: [-1.6244, 6.6884] },
    addressLine1: 'Kejetia Market Road',
  },

  // ========== MIDDLE EAST ==========
  // United Arab Emirates (AE)
  {
    regionCode: 'middle-east',
    countryIso2: 'AE',
    countryRegion: 'Dubai',
    city: 'Dubai',
    name: 'Dubai Cooling Solutions LLC',
    phones: ['+971 4 234 5678', '+971 4 234 5679'],
    location: { lat: 25.2048, lng: 55.2708 },
    geo: { type: 'Point', coordinates: [55.2708, 25.2048] },
    addressLine1: 'Al Quoz Industrial Area 3',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'AE',
    countryRegion: 'Abu Dhabi',
    city: 'Abu Dhabi',
    name: 'Capital Ventilation Trading',
    phones: ['+971 2 345 6789'],
    location: { lat: 24.4539, lng: 54.3773 },
    geo: { type: 'Point', coordinates: [54.3773, 24.4539] },
    addressLine1: 'Mussafah Industrial Area',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'AE',
    countryRegion: 'Sharjah',
    city: 'Sharjah',
    name: 'Sharjah Air Systems',
    phones: ['+971 6 567 8901'],
    location: { lat: 25.3463, lng: 55.4209 },
    geo: { type: 'Point', coordinates: [55.4209, 25.3463] },
    addressLine1: 'Industrial Area 10',
  },

  // Saudi Arabia (SA)
  {
    regionCode: 'middle-east',
    countryIso2: 'SA',
    countryRegion: 'Makkah',
    city: 'Jeddah',
    name: 'Al Dar Trading (Branch Of Haitham Est. For Trading)',
    phones: ['+966 12648 6405', '+966 12647 3431'],
    location: { lat: 21.4858, lng: 39.1925 },
    geo: { type: 'Point', coordinates: [39.1925, 21.4858] },
    addressLine1: 'King Fahd Road',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'SA',
    countryRegion: 'Riyadh',
    city: 'Riyadh',
    name: 'Riyadh Ventilation Center',
    phones: ['+966 11 456 7890'],
    location: { lat: 24.7136, lng: 46.6753 },
    geo: { type: 'Point', coordinates: [46.6753, 24.7136] },
    addressLine1: 'King Abdullah Road',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'SA',
    countryRegion: 'Eastern Province',
    city: 'Dammam',
    name: 'Eastern Air Solutions',
    phones: ['+966 13 567 8901'],
    location: { lat: 26.4207, lng: 50.0888 },
    geo: { type: 'Point', coordinates: [50.0888, 26.4207] },
    addressLine1: 'Industrial City',
  },

  // Qatar (QA)
  {
    regionCode: 'middle-east',
    countryIso2: 'QA',
    countryRegion: 'Doha',
    city: 'Doha',
    name: 'Qatar Cooling Center',
    phones: ['+974 4456 7890'],
    location: { lat: 25.2867, lng: 51.5310 },
    geo: { type: 'Point', coordinates: [51.5310, 25.2867] },
    addressLine1: 'West Bay Area',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'QA',
    countryRegion: 'Al Wakrah',
    city: 'Al Wakrah',
    name: 'Al Wakrah Ventilation Store',
    phones: ['+974 4567 8901'],
    location: { lat: 25.1716, lng: 51.6038 },
    geo: { type: 'Point', coordinates: [51.6038, 25.1716] },
    addressLine1: 'Industrial Area',
  },

  // Kuwait (KW)
  {
    regionCode: 'middle-east',
    countryIso2: 'KW',
    countryRegion: 'Al Asimah',
    city: 'Kuwait City',
    name: 'Bin Nisf – General Trading & Trading & Cont. Co.',
    phones: ['+965 2234 5678'],
    location: { lat: 29.3759, lng: 47.9774 },
    geo: { type: 'Point', coordinates: [47.9774, 29.3759] },
    addressLine1: 'Street 17, Block 54, Shuwaikh',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'KW',
    countryRegion: 'Hawalli',
    city: 'Hawalli',
    name: 'Hawalli Air Solutions',
    phones: ['+965 2567 8901'],
    location: { lat: 29.3328, lng: 48.0285 },
    geo: { type: 'Point', coordinates: [48.0285, 29.3328] },
    addressLine1: 'Tunis Street',
  },

  // Bahrain (BH)
  {
    regionCode: 'middle-east',
    countryIso2: 'BH',
    countryRegion: 'Capital Governorate',
    city: 'Manama',
    name: 'Manama Ventilation Trading',
    phones: ['+973 1723 4567'],
    location: { lat: 26.2285, lng: 50.5860 },
    geo: { type: 'Point', coordinates: [50.5860, 26.2285] },
    addressLine1: 'Diplomatic Area',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'BH',
    countryRegion: 'Muharraq Governorate',
    city: 'Muharraq',
    name: 'Muharraq Air Systems',
    phones: ['+973 1745 6789'],
    location: { lat: 26.2572, lng: 50.6119 },
    geo: { type: 'Point', coordinates: [50.6119, 26.2572] },
    addressLine1: 'Sheikh Hamad Causeway',
  },

  // Oman (OM)
  {
    regionCode: 'middle-east',
    countryIso2: 'OM',
    countryRegion: 'Muscat',
    city: 'Muscat',
    name: 'Muscat Cooling Solutions',
    phones: ['+968 2456 7890'],
    location: { lat: 23.5880, lng: 58.3829 },
    geo: { type: 'Point', coordinates: [58.3829, 23.5880] },
    addressLine1: 'Ruwi High Street',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'OM',
    countryRegion: 'Al Batinah North',
    city: 'Sohar',
    name: 'Sohar Industrial Fans',
    phones: ['+968 2678 9012'],
    location: { lat: 24.3461, lng: 56.7075 },
    geo: { type: 'Point', coordinates: [56.7075, 24.3461] },
    addressLine1: 'Sohar Industrial Estate',
  },

  // Jordan (JO)
  {
    regionCode: 'middle-east',
    countryIso2: 'JO',
    countryRegion: 'Amman',
    city: 'Amman',
    name: 'Amman Ventilation Center',
    phones: ['+962 6 567 8901'],
    location: { lat: 31.9454, lng: 35.9284 },
    geo: { type: 'Point', coordinates: [35.9284, 31.9454] },
    addressLine1: 'Sweifieh, Rainbow Street',
  },
  {
    regionCode: 'middle-east',
    countryIso2: 'JO',
    countryRegion: 'Irbid',
    city: 'Irbid',
    name: 'Northern Air Solutions',
    phones: ['+962 2 678 9012'],
    location: { lat: 32.5556, lng: 35.8500 },
    geo: { type: 'Point', coordinates: [35.8500, 32.5556] },
    addressLine1: 'University Street',
  },
];

// ============================================================================
// Index Creation
// ============================================================================

/**
 * Create unique indexes to enforce data integrity and idempotency
 */
async function createIndexes(): Promise<void> {
  const { db } = await connectToDatabase();

  // Create unique index on regions.code
  await db.collection(COLLECTIONS.REGIONS).createIndex(
    { code: 1 },
    { unique: true, name: 'idx_regions_code_unique' }
  );

  // Create unique index on countries.iso2
  await db.collection(COLLECTIONS.COUNTRIES).createIndex(
    { iso2: 1 },
    { unique: true, name: 'idx_countries_iso2_unique' }
  );

  // Create index on countries.regionCode for efficient lookups
  await db.collection(COLLECTIONS.COUNTRIES).createIndex(
    { regionCode: 1 },
    { name: 'idx_countries_region_code' }
  );

  // Create unique index on categories.code
  await db.collection(COLLECTIONS.CATEGORIES).createIndex(
    { code: 1 },
    { unique: true, name: 'idx_categories_code_unique' }
  );

  // Create index on categories.sortOrder for stable ordering
  await db.collection(COLLECTIONS.CATEGORIES).createIndex(
    { sortOrder: 1 },
    { name: 'idx_categories_sort_order' }
  );

  // Create compound unique index on subcategories (categoryCode + code)
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1, code: 1 },
    { unique: true, name: 'idx_subcategories_category_code_unique' }
  );

  // Create index on subcategories.categoryCode for efficient lookups
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1 },
    { name: 'idx_subcategories_category_code' }
  );

  // Create index on subcategories.sortOrder for stable ordering
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1, sortOrder: 1 },
    { name: 'idx_subcategories_sort_order' }
  );

  // Create unique index on stores for upsert identity
  await db.collection(COLLECTIONS.STORES).createIndex(
    { countryIso2: 1, city: 1, name: 1 },
    { unique: true, name: 'idx_stores_country_city_name_unique' }
  );

  // Create index on stores for region/country filtering
  await db.collection(COLLECTIONS.STORES).createIndex(
    { regionCode: 1, countryIso2: 1, isActive: 1 },
    { name: 'idx_stores_region_country_active' }
  );

  // Create index on stores for city lookup
  await db.collection(COLLECTIONS.STORES).createIndex(
    { countryIso2: 1, city: 1 },
    { name: 'idx_stores_country_city' }
  );

  // Create 2dsphere index for geospatial queries (nearest sorting)
  await db.collection(COLLECTIONS.STORES).createIndex(
    { geo: '2dsphere' },
    { name: 'idx_stores_geo_2dsphere' }
  );

  console.log('[Seed] Indexes created successfully');
}

// ============================================================================
// Seeding Logic
// ============================================================================

/**
 * Check if a collection needs seeding (doesn't exist or is empty)
 */
async function needsSeeding(collectionName: string): Promise<boolean> {
  const { db } = await connectToDatabase();

  // Check if collection exists
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    return true;
  }

  // Check if collection has documents
  const count = await db.collection(collectionName).countDocuments();
  return count === 0;
}

/**
 * Seed regions collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedRegions(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.REGIONS);

  let insertedCount = 0;
  const now = new Date();

  for (const regionData of SEED_REGIONS) {
    // Validate the data using Zod
    const validatedData = validateCreateRegion(regionData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed countries collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedCountries(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.COUNTRIES);

  let insertedCount = 0;
  const now = new Date();

  for (const countryData of SEED_COUNTRIES) {
    // Validate the data using Zod
    const validatedData = validateCreateCountry(countryData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { iso2: validatedData.iso2 },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed categories collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedCategories(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.CATEGORIES);

  let insertedCount = 0;
  const now = new Date();

  for (const categoryData of SEED_CATEGORIES) {
    // Validate the data using Zod
    const validatedData = validateCreateCategory(categoryData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed subcategories collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedSubcategories(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.SUBCATEGORIES);

  let insertedCount = 0;
  const now = new Date();

  for (const subcategoryData of SEED_SUBCATEGORIES) {
    // Validate the data using Zod
    const validatedData = validateCreateSubcategory(subcategoryData);

    // Upsert to ensure idempotency (using compound key: categoryCode + code)
    const result = await collection.updateOne(
      { categoryCode: validatedData.categoryCode, code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed stores collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedStores(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.STORES);

  let insertedCount = 0;
  const now = new Date();

  for (const storeData of SEED_STORES) {
    // Validate the data using Zod (add isActive default)
    const validatedData = validateCreateStore({
      ...storeData,
      isActive: true,
    });

    // Upsert to ensure idempotency (using compound key: countryIso2 + city + name)
    const result = await collection.updateOne(
      { countryIso2: validatedData.countryIso2, city: validatedData.city, name: validatedData.name },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// ============================================================================
// Main Seeding Function
// ============================================================================

export interface SeedResult {
  regionsSeeded: number;
  countriesSeeded: number;
  categoriesSeeded: number;
  subcategoriesSeeded: number;
  storesSeeded: number;
  productsSeeded: number;
  indexesCreated: boolean;
  skipped: boolean;
}

/**
 * Run the database seeding process.
 * This is idempotent and safe to run multiple times.
 * 
 * @param force - If true, seed even if collections have data
 */
export async function seedDatabase(force = false): Promise<SeedResult> {
  const result: SeedResult = {
    regionsSeeded: 0,
    countriesSeeded: 0,
    categoriesSeeded: 0,
    subcategoriesSeeded: 0,
    storesSeeded: 0,
    productsSeeded: 0,
    indexesCreated: false,
    skipped: false,
  };

  try {
    // Create indexes first (idempotent operation)
    await createIndexes();
    result.indexesCreated = true;

    // Check if seeding is needed
    const regionsNeedSeeding = force || await needsSeeding(COLLECTIONS.REGIONS);
    const countriesNeedSeeding = force || await needsSeeding(COLLECTIONS.COUNTRIES);
    const categoriesNeedSeeding = force || await needsSeeding(COLLECTIONS.CATEGORIES);
    const subcategoriesNeedSeeding = force || await needsSeeding(COLLECTIONS.SUBCATEGORIES);
    const storesNeedSeeding = force || await needsSeeding(COLLECTIONS.STORES);

    if (!regionsNeedSeeding && !countriesNeedSeeding && !categoriesNeedSeeding && !subcategoriesNeedSeeding && !storesNeedSeeding) {
      console.log('[Seed] Database already seeded, skipping...');
      result.skipped = true;
    } else {
      // Seed regions if needed
      if (regionsNeedSeeding) {
        result.regionsSeeded = await seedRegions();
        console.log(`[Seed] Seeded ${result.regionsSeeded} regions`);
      }

      // Seed countries if needed
      if (countriesNeedSeeding) {
        result.countriesSeeded = await seedCountries();
        console.log(`[Seed] Seeded ${result.countriesSeeded} countries`);
      }

      // Seed categories if needed
      if (categoriesNeedSeeding) {
        result.categoriesSeeded = await seedCategories();
        console.log(`[Seed] Seeded ${result.categoriesSeeded} categories`);
      }

      // Seed subcategories if needed
      if (subcategoriesNeedSeeding) {
        result.subcategoriesSeeded = await seedSubcategories();
        console.log(`[Seed] Seeded ${result.subcategoriesSeeded} subcategories`);
      }

      // Seed stores if needed (after regions and countries for referential integrity)
      if (storesNeedSeeding) {
        result.storesSeeded = await seedStores();
        console.log(`[Seed] Seeded ${result.storesSeeded} stores`);
      }
    }

    // Bootstrap products collection AFTER all references are seeded
    // Products may reference regions, countries, categories, and subcategories
    const { db } = await connectToDatabase();
    const productsResult = await bootstrapProducts(
      db,
      COLLECTIONS.PRODUCTS,
      createProductsIndexes,
      force,
      {
        categories: COLLECTIONS.CATEGORIES,
        subcategories: COLLECTIONS.SUBCATEGORIES,
        regions: COLLECTIONS.REGIONS,
        countries: COLLECTIONS.COUNTRIES,
      }
    );
    result.productsSeeded = productsResult.inserted;

    console.log('[Seed] Database seeding completed successfully');
    return result;
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    throw error;
  }
}

/**
 * Initialize the database on application startup.
 * This ensures indexes and seed data are in place.
 */
export async function initializeDatabase(): Promise<boolean> {
  console.log('[DB] Initializing database...');

  try {
    await seedDatabase();
    console.log('[DB] Database initialization complete');
    return true;
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    // Don't throw - allow the app to start even if seeding fails
    // The API routes will handle connection errors appropriately
    return false;
  }
}
