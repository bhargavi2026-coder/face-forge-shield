import { Shield, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-overlay" />
      
      <div className="container relative z-10 px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Powered by ForensicFace++ Dataset</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
          DeepFake Detection
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Advanced AI-Powered Media Authentication
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
          Detect manipulated images and videos using state-of-the-art deep learning models 
          trained on the ForensicFace++ dataset. Robust against adversarial attacks.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            variant="hero"
            onClick={scrollToUpload}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5" />
            Start Detection
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};
