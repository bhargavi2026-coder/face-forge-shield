import { Database, Shield, Cpu, Layers } from "lucide-react";
import { Card } from "./ui/card";

export const AboutSection = () => {
  const features = [
    {
      icon: Database,
      title: "ForensicFace++ Dataset",
      description: "Trained on comprehensive dataset containing real and manipulated facial images with diverse manipulation techniques."
    },
    {
      icon: Shield,
      title: "Adversarial Resistance",
      description: "Models hardened against adversarial attacks (FGSM, PGD, C&W, DeepFool), ensuring reliable detection even with sophisticated perturbations."
    },
    {
      icon: Cpu,
      title: "Deep Learning Models",
      description: "State-of-the-art neural networks including CNNs and attention mechanisms for accurate fake detection."
    },
    {
      icon: Layers,
      title: "Multi-Feature Analysis",
      description: "Analyzes facial landmarks, texture consistency, compression artifacts, and temporal coherence for comprehensive detection."
    }
  ];

  return (
    <section id="about-section" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Technology Overview</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our deep fake detection system leverages cutting-edge AI technology and 
            comprehensive training data to identify manipulated media.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 border-primary/20 hover:shadow-card transition-all duration-300 hover:border-primary/40"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8 border-primary/20 shadow-card bg-gradient-to-br from-card to-secondary/50">
          <h3 className="text-2xl font-bold mb-4">About ForensicFace++</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              ForensicFace++ is a comprehensive dataset specifically designed for deepfake detection research. 
              It contains a large collection of both authentic and manipulated facial images and videos, 
              created using various state-of-the-art face manipulation techniques.
            </p>
            <p>
              The dataset includes manipulations from methods such as Face2Face, FaceSwap, DeepFakes, 
              and NeuralTextures, providing diverse training data for robust model development.
            </p>
            <p className="text-sm">
              Dataset available on Kaggle for research purposes. Our models are continuously trained 
              and updated to detect emerging manipulation techniques.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
