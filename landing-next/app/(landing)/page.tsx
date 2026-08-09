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
import ScrollEffects from '@/components/ScrollEffects'

export default function Home() {
  return (
    <>
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
    </>
  )
}
