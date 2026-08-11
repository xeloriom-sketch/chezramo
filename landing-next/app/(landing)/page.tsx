import TVRedirect from '@/components/TVRedirect'
import Header from '@/components/Header'
import FloatingCartButton from '@/components/FloatingCartButton'
import Hero from '@/components/Hero'
import DifferenceSection from '@/components/DifferenceSection'
import BestSellers from '@/components/BestSellers'
import MenuSection from '@/components/MenuSection'
import ReviewsSection from '@/components/ReviewsSection'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import CustomizerSheet from '@/components/CustomizerSheet'
import CheckoutModal from '@/components/CheckoutModal'
import TicketViewer from '@/components/TicketViewer'
import ScrollEffects from '@/components/ScrollEffects'

/* ── JSON-LD Structured Data ── */
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': 'https://www.chezramo.fr/#restaurant',
  name: 'Chez Ramo',
  url: 'https://www.chezramo.fr',
  telephone: '+33427500062',
  email: 'contact@chezramo.fr',
  image: [
    'https://www.chezramo.fr/uploads/pasted-1785851492914-0.webp',
  ],
  logo: 'https://www.chezramo.fr/favicon.svg',
  description: 'Restaurant kebab et tacos halal à Lagnieu (Ain). Broche artisanale, galettes, burgers, spécialités balkaniques. Commande en ligne disponible. Ouvert 7j/7.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '32 Rue Pasteur',
    addressLocality: 'Lagnieu',
    postalCode: '01150',
    addressRegion: 'Ain',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.9117,
    longitude: 5.3439,
  },
  hasMap: 'https://maps.google.com/?q=32+Rue+Pasteur+01150+Lagnieu',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '14:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '18:00',
      closes: '22:30',
    },
  ],
  servesCuisine: ['Kebab', 'Tacos', 'Burgers', 'Balkanique', 'Halal', 'Restauration rapide'],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '3.6',
    reviewCount: '161',
    bestRating: '5',
    worstRating: '1',
  },
  areaServed: [
    { '@type': 'City', name: 'Lagnieu', '@id': 'https://www.wikidata.org/wiki/Q209278' },
    { '@type': 'City', name: 'Ambérieu-en-Bugey' },
    { '@type': 'City', name: 'Lagnieu' },
    { '@type': 'AdministrativeArea', name: 'Ain' },
  ],
  menu: 'https://www.chezramo.fr/#menu',
  sameAs: [
    'https://www.facebook.com/chezramolagnieu',
    'https://www.instagram.com/chez_ramo2026',
  ],
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Halal certifié', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'À emporter', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Commande en ligne', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Fait maison', value: true },
  ],
  potentialAction: {
    '@type': 'OrderAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.chezramo.fr/#menu',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModePickUp'],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: 'https://www.chezramo.fr',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Menu & Carte',
      item: 'https://www.chezramo.fr/#menu',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Où se trouve Chez Ramo à Lagnieu ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chez Ramo est situé au 32 Rue Pasteur, 01150 Lagnieu (Ain), près d\'Ambérieu-en-Bugey.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels sont les horaires de Chez Ramo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chez Ramo est ouvert 7j/7 : le midi de 11h00 à 14h30 et le soir de 18h00 à 22h30.',
      },
    },
    {
      '@type': 'Question',
      name: 'Est-ce que Chez Ramo propose de la nourriture halal ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, Chez Ramo propose exclusivement de la viande halal. La broche de veau est préparée artisanalement sur place.',
      },
    },
    {
      '@type': 'Question',
      name: 'Peut-on commander en ligne chez Chez Ramo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, vous pouvez commander en ligne directement sur notre site et venir retirer votre commande au restaurant au 32 Rue Pasteur, Lagnieu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels plats propose Chez Ramo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chez Ramo propose des kebabs, galettes (durum), tacos, burgers, assiettes kebab, frites, spécialités balkaniques (burek, kofte, pleskavice), desserts et boissons.',
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <TVRedirect />
      <ScrollEffects />
      <FloatingCartButton />
      <Header />
      <main>
        <Hero />
        <DifferenceSection />
        <BestSellers />
        <MenuSection />
        <ReviewsSection />
      </main>
      <Footer />
      <CustomizerSheet />
      <CartSidebar />
      <CheckoutModal />
      <TicketViewer />
    </>
  )
}
