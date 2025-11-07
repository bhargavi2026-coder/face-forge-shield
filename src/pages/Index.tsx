import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { AboutSection } from "@/components/AboutSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <UploadSection />
      <AboutSection />
    </main>
  );
};

export default Index;
