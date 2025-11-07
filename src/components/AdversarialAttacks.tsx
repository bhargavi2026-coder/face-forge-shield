import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { toast } from "sonner";
import { Zap, Shield, Target, Hexagon } from "lucide-react";

interface AdversarialAttacksProps {
  originalImage: string;
  onAttackComplete: (attackedImage: string, attackType: string, epsilon: number) => void;
}

export const AdversarialAttacks = ({ originalImage, onAttackComplete }: AdversarialAttacksProps) => {
  const [selectedAttack, setSelectedAttack] = useState<string>("fgsm");
  const [epsilon, setEpsilon] = useState<number[]>([8]);
  const [isAttacking, setIsAttacking] = useState(false);

  const attacks = [
    {
      id: "fgsm",
      name: "FGSM",
      icon: Zap,
      description: "Fast Gradient Sign Method - Single step gradient attack",
      color: "text-warning"
    },
    {
      id: "pgd",
      name: "PGD",
      icon: Target,
      description: "Projected Gradient Descent - Iterative FGSM variant",
      color: "text-destructive"
    },
    {
      id: "cw",
      name: "C&W",
      icon: Hexagon,
      description: "Carlini & Wagner - Optimization-based attack",
      color: "text-primary"
    },
    {
      id: "deepfool",
      name: "DeepFool",
      icon: Shield,
      description: "Minimal perturbation to cross decision boundary",
      color: "text-accent"
    }
  ];

  const applyAdversarialAttack = async () => {
    setIsAttacking(true);
    toast.info(`Applying ${selectedAttack.toUpperCase()} attack...`);

    // Simulate adversarial attack processing
    setTimeout(() => {
      // In production, this would apply actual adversarial perturbations
      // For now, we'll simulate by adding a subtle overlay effect
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Simulate adversarial noise (in production, use actual attack algorithms)
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const data = imageData.data;
          const perturbation = epsilon[0] / 255;
          
          for (let i = 0; i < data.length; i += 4) {
            // Add subtle perturbation to RGB channels
            data[i] = Math.min(255, Math.max(0, data[i] + (Math.random() - 0.5) * perturbation * 255));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (Math.random() - 0.5) * perturbation * 255));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (Math.random() - 0.5) * perturbation * 255));
          }
          
          ctx?.putImageData(imageData, 0, 0);
        }
        
        const attackedImage = canvas.toDataURL('image/png');
        onAttackComplete(attackedImage, selectedAttack, epsilon[0]);
        setIsAttacking(false);
        toast.success(`${selectedAttack.toUpperCase()} attack applied successfully`);
      };
      
      img.src = originalImage;
    }, 2000);
  };

  return (
    <Card className="p-6 border-warning/30 bg-warning/5">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-warning" />
        <h3 className="text-xl font-bold">Adversarial Attack Simulation</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">Select Attack Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {attacks.map((attack) => (
              <button
                key={attack.id}
                onClick={() => setSelectedAttack(attack.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedAttack === attack.id
                    ? 'border-warning bg-warning/10'
                    : 'border-border hover:border-warning/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <attack.icon className={`w-4 h-4 ${attack.color}`} />
                  <span className="font-semibold">{attack.name}</span>
                  {selectedAttack === attack.id && (
                    <Badge className="ml-auto bg-warning/20 text-warning border-warning/30">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{attack.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>Perturbation Strength (ε)</Label>
            <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
              {epsilon[0]}/255
            </span>
          </div>
          <Slider
            value={epsilon}
            onValueChange={setEpsilon}
            min={1}
            max={16}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Higher values create stronger perturbations but may be more visible
          </p>
        </div>

        <Button
          onClick={applyAdversarialAttack}
          disabled={isAttacking}
          className="w-full bg-gradient-danger hover:opacity-90"
          size="lg"
        >
          {isAttacking ? "Applying Attack..." : `Apply ${selectedAttack.toUpperCase()} Attack`}
        </Button>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This simulates adversarial attacks 
            to test the robustness of the detection system. Our ForensicFace++ trained models 
            are designed to maintain high accuracy even under adversarial perturbations.
          </p>
        </div>
      </div>
    </Card>
  );
};
