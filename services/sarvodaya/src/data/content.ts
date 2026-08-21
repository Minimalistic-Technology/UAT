import { MapPin, Phone, Mail, Factory, Building2, Clock } from 'lucide-react';

export const COMPANY = {
  name: 'Sarvodaya Industries',
  brand: 'AASHOK Self Adhesive Tapes',
  tagline: 'Sticking to quality since 2000',
  established: 2000,
  iso: 'ISO 9001:2015 TUV Certified',
  capacity: '150 Million Sq. Mtr / annum',
  email: 'info@sarvodayaind.com',
  marketingPhone: '+91 9769108393',
  productionPhone: '+91 9820045376',
  tel: '022 2683 2668 / 69',
  offices: [
    {
      icon: Building2,
      label: 'Mumbai, Maharashtra',
      role: 'Headquarters',
      address:
        '1206, 12th Floor, Hub Town Solaris, N.S. Phadke Marg, Opp. Telli Galli, Andheri East, Mumbai - 400 069.',
      contact: 'Darshit — Marketing',
      phone: '+91 9769108393',
    },
    {
      icon: Factory,
      label: 'Vapi, Gujarat',
      role: 'Manufacturing Facility',
      address:
        'Plot No 67 & 70, Daman Ganga Industrial Park, Near Noor Weigh Bridge, Village - Dungara, Tal - Vapi, Gujarat - 396191.',
      contact: 'Ashish — Production',
      phone: '+91 9820045376',
    },
  ],
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  image: string;
  accent: string;
  icon: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 'industrial-packing-tapes',
    name: 'Industrial Packing Tapes',
    tagline: 'Transparent, brown & printed',
    description:
      'Used across industries, e-commerce warehouses and godowns for sealing cartons. Printed tapes carry your branding on every carton — up to 8 colours — and signal tamper evidence in transit.',
    features: [
      'High tensile strength',
      'Excellent tackiness',
      'Long shelf life',
      'Strong grip',
      'Up to 8-colour printing',
    ],
    image: '/industrial_packaging_tapesv1.jpg',
    accent: 'forest',
    icon: 'Box',
  },
  {
    id: 'bundling-tapes',
    name: 'Bundling Tapes',
    tagline: 'Promotional & FMCG offers',
    description:
      'Bundles packages together for promotions — widely used in FMCG to promote soaps and consumer goods. Printed to highlight offers and drive shelf visibility.',
    features: [
      'Clean, consistent peel',
      'Bright promotional prints',
      'Reliable bundle strength',
      'Custom widths',
    ],
    image: '/bundling_tapesv1.jpg',
    accent: 'brand',
    icon: 'Package',
  },
  {
    id: 'no-noise-tapes',
    name: 'No Noise Tapes',
    tagline: 'Smooth, pressure-free unwind',
    description:
      'Unwinds smoothly when held from one end without applied pressure — ideal for high-speed packing lines where every second counts.',
    features: [
      'Silent unwind',
      'No pressure required',
      'Built for high-speed lines',
      'Consistent release',
    ],
    image: '/no_noise_tapesv1.jpg',
    accent: 'forest',
    icon: 'VolumeOff',
  },
  {
    id: 'easy-tear-tapes',
    name: 'Easy Tear Tapes',
    tagline: 'No scissors needed',
    description:
      'For household and retail use where high-tensile BOPP is overkill. Tears cleanly by hand so two packages separate without tools.',
    features: [
      'Tears by hand',
      'Clean edge',
      'Replaces scissors',
      'Everyday convenience',
    ],
    image: '/easy_to_tear_tapesv1.jpg',
    accent: 'brand',
    icon: 'Scissors',
  },
  {
    id: 'stationary-tapes',
    name: 'Stationary Tapes',
    tagline: 'Aashok Wonder — multi-colour',
    description:
      'General-purpose coloured tapes in green, blue, black, red, orange, purple and more. Made in custom widths on request, and famous in the market under the Aashok Wonder name.',
    features: [
      'Vivid colour range',
      'Custom widths',
      'Brand: Aashok Wonder',
      'Stationery-grade finish',
    ],
    image: '/stationary_tapesv1.jpg',
    accent: 'forest',
    icon: 'Palette',
  },
  {
    id: 'jumbo-rolls',
    name: 'Jumbo Rolls',
    tagline: 'Up to 1650mm width',
    description:
      'Maximum 1650mm BOPP jumbo rolls for slitting operations. Higher widths yield more tapes per batch, with uniform coating and weight throughout.',
    features: [
      'Up to 1650mm width',
      'Uniform adhesive coating',
      'Consistent weight',
      'Higher yield per slit batch',
    ],
    image: '/jumbo_rollsv1.jpg',
    accent: 'brand',
    icon: 'Roll',
  },
];

export const STATS = [
  { value: '2000', label: 'Established', suffix: '' },
  { value: '150', label: 'M Sq. Mtr / annum capacity', suffix: '+' },
  { value: '25', label: 'Years of manufacturing', suffix: '+' },
  { value: '1650', label: 'mm max jumbo width', suffix: '' },
];

export const TIMELINE = [
  {
    year: 'Origins',
    title: 'Three decades in packaging',
    body: 'Founder Mr. Ashish Jhaveri, under the guidance of his father, built deep experience across corrugated box packaging, release paper manufacturing and self-adhesive solutions.',
  },
  {
    year: '2000',
    title: 'Sarvodaya Industries founded',
    body: 'Began as a small-scale unit with a clear goal: dependable quality BOPP self-adhesive tape at competitive pricing, marketed under the AASHOK brand.',
  },
  {
    year: 'Growth',
    title: 'One of India\u2019s largest BOPP tape makers',
    body: 'Progressive strategy and rich packaging expertise propelled Sarvodaya to an installed capacity of 150 Million Sq. Mtr per annum.',
  },
  {
    year: 'Today',
    title: 'ISO 9001:2015 TUV Certified',
    body: 'A trusted manufacturer and exporter serving industries, e-commerce, FMCG and distributors across India and overseas from Mumbai HQ and Vapi factory.',
  },
];

export const CAPABILITIES = [
  {
    title: 'Customized packaging solutions',
    body: 'Plain or printed tapes in various thicknesses, colours, widths and lengths — tailored to your line.',
    icon: 'SlidersHorizontal',
  },
  {
    title: 'Contract manufacturing',
    body: 'A reliable manufacturing partner for brands that need dependable supply and consistent quality.',
    icon: 'Handshake',
  },
  {
    title: 'Distribution & dealerships',
    body: 'Opportunities for networking agents, dealers and distributors for the AASHOK commercial brand.',
    icon: 'Truck',
  },
  {
    title: 'Export-ready production',
    body: 'Manufacturing built for export volumes, centrally located to serve wide transportation networks.',
    icon: 'Ship',
  },
];

export const PROCESS_STEPS = [
  {
    title: 'Extrusion & coating',
    body: 'BOPP film is coated with a pressure-sensitive adhesive under controlled, uniform conditions.',
    icon: 'Layers',
  },
  {
    title: 'Slitting',
    body: 'Jumbo rolls are slit to the precise widths and lengths each customer specifies.',
    icon: 'Scissors',
  },
  {
    title: 'Printing',
    body: 'Up to 8-colour flexographic printing for branded and tamper-evident tapes.',
    icon: 'Printer',
  },
  {
    title: 'Quality & dispatch',
    body: 'Every batch is checked for tensile strength, tack and weight before it ships.',
    icon: 'BadgeCheck',
  },
];

export const CONTACT_ICON_MAP = { MapPin, Phone, Mail, Clock } as const;
