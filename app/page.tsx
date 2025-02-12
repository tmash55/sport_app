import { Hero } from "@/components/Hero";
import {Navigation } from "@/components/Navigation"
import { AboutContest } from "@/components/AboutContest"
import { FeaturedContests } from "@/components/FeaturedContests"
import { Testimonials } from "@/components/Testimonials"
import { Features } from "@/components/FeaturesGrid"
import { CallToAction } from "@/components/CallToAction"
import { Footer } from "@/components/Footer"
import WhyChooseDryft from "@/components/WhyChooseDraftPlay";



export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navigation />
      <Hero/>
      <AboutContest />
      <Features />
      <FeaturedContests />
      <Testimonials />
      <WhyChooseDryft/>
      <CallToAction />
      <Footer />
    </main>
  );
}
