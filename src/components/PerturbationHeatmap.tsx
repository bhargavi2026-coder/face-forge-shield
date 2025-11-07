import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity } from "lucide-react";

interface PerturbationHeatmapProps {
  originalImage: string;
  attackedImage: string;
}

interface PerturbationMetrics {
  meanPerturbation: number;
  maxPerturbation: number;
  l2Norm: number;
  affectedPixels: number;
}

export const PerturbationHeatmap = ({ originalImage, attackedImage }: PerturbationHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<PerturbationMetrics | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateHeatmap();
  }, [originalImage, attackedImage]);

  const generateHeatmap = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const original = new Image();
    const attacked = new Image();

    original.crossOrigin = "anonymous";
    attacked.crossOrigin = "anonymous";

    await Promise.all([
      new Promise((resolve) => {
        original.onload = resolve;
        original.src = originalImage;
      }),
      new Promise((resolve) => {
        attacked.onload = resolve;
        attacked.src = attackedImage;
      })
    ]);

    canvas.width = original.width;
    canvas.height = original.height;

    // Draw original image to get pixel data
    ctx.drawImage(original, 0, 0);
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Draw attacked image to get pixel data
    ctx.drawImage(attacked, 0, 0);
    const attackedData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Calculate differences and create heatmap
    const heatmapData = ctx.createImageData(canvas.width, canvas.height);
    let totalDiff = 0;
    let maxDiff = 0;
    let l2Sum = 0;
    let affectedCount = 0;
    const threshold = 5; // Minimum difference to count as affected

    for (let i = 0; i < originalData.data.length; i += 4) {
      const rDiff = Math.abs(originalData.data[i] - attackedData.data[i]);
      const gDiff = Math.abs(originalData.data[i + 1] - attackedData.data[i + 1]);
      const bDiff = Math.abs(originalData.data[i + 2] - attackedData.data[i + 2]);
      
      // Calculate magnitude of difference
      const diff = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
      totalDiff += diff;
      maxDiff = Math.max(maxDiff, diff);
      l2Sum += diff * diff;

      if (diff > threshold) {
        affectedCount++;
      }

      // Normalize to 0-255 range and apply color mapping
      const normalized = Math.min(255, (diff / Math.sqrt(3 * 255 * 255)) * 255);
      
      // Blue to Yellow to Red color scheme for heatmap
      if (normalized < 128) {
        // Blue to Yellow
        const t = normalized / 128;
        heatmapData.data[i] = Math.floor(t * 255);     // R
        heatmapData.data[i + 1] = Math.floor(t * 255); // G
        heatmapData.data[i + 2] = Math.floor((1 - t) * 255); // B
      } else {
        // Yellow to Red
        const t = (normalized - 128) / 127;
        heatmapData.data[i] = 255;                     // R
        heatmapData.data[i + 1] = Math.floor((1 - t) * 255); // G
        heatmapData.data[i + 2] = 0;                   // B
      }
      
      heatmapData.data[i + 3] = 255; // Alpha
    }

    ctx.putImageData(heatmapData, 0, 0);

    const pixelCount = originalData.data.length / 4;
    setMetrics({
      meanPerturbation: totalDiff / pixelCount,
      maxPerturbation: maxDiff,
      l2Norm: Math.sqrt(l2Sum),
      affectedPixels: (affectedCount / pixelCount) * 100
    });

    setIsGenerating(false);
  };

  return (
    <Card className="p-6 border-accent/30 bg-accent/5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold">Perturbation Heatmap</h3>
      </div>

      <div className="space-y-4">
        <div className="relative bg-muted/30 rounded-lg overflow-hidden">
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto"
          />
          
          {/* Color scale legend */}
          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">Perturbation Scale</span>
            </div>
            <div className="flex gap-1 h-3 w-32 rounded overflow-hidden">
              <div className="flex-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Mean Perturbation</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {metrics.meanPerturbation.toFixed(2)}
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Max Perturbation</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {metrics.maxPerturbation.toFixed(2)}
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">L2 Norm</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {(metrics.l2Norm / 1000).toFixed(2)}k
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Affected Pixels</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {metrics.affectedPixels.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
            Low Change
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
            Medium Change
          </Badge>
          <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
            High Change
          </Badge>
        </div>
      </div>
    </Card>
  );
};
