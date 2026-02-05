import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Categories } from "@/components/marketing/categories";
import { Manifesto } from "@/components/marketing/manifesto";
import { CTA } from "@/components/marketing/cta";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <Categories />
      <Manifesto />
      <CTA />
    </div>
  );
}
