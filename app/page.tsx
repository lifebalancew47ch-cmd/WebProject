import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { WatchProductSection } from "@/components/landing/WatchProductSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { ProcessSection } from "@/components/landing/ProcessSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F9F5] text-slate-800 font-sans">
      <Navbar />
      <HeroSection />
      <WatchProductSection />
      <FeaturesGrid />
      <ProcessSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
