import { Hero } from "@/components/Hero";
import {Navigation } from "@/components/Navigation"
import { AboutContest } from "@/components/AboutContest"
import { FeaturedContests } from "@/components/FeaturedContests"
import { Testimonials } from "@/components/Testimonials"
import { WhyChooseDraftPlay } from "@/components/WhyChooseDraftPlay"
import { CallToAction } from "@/components/CallToAction"
import { Footer } from "@/components/Footer"



export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navigation />
      <Hero/>
      <AboutContest />
      <FeaturedContests />
      <Testimonials />
      <WhyChooseDraftPlay />
      <CallToAction />
      <Footer />
    </main>
  );
}
