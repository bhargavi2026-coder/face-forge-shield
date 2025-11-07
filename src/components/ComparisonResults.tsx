import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Shield, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface ComparisonResultsProps {
  originalResults: any;
  attackedResults: any;
  attackType: string;
  epsilon: number;
  originalImage: string;
  attackedImage: string;
}

export const ComparisonResults = ({
  originalResults,
  attackedResults,
  attackType,
  epsilon,
  originalImage,
  attackedImage
}: ComparisonResultsProps) => {
  const confidenceDrop = originalResults.confidence - attackedResults.confidence;
  const maintainedAccuracy = ((attackedResults.confidence / originalResults.confidence) * 100);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Robustness Analysis</h3>
          <Badge className="bg-warning/20 text-warning border-warning/30">
            {attackType.toUpperCase()} Attack Applied
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Original Image</p>
            <img src={originalImage} alt="Original" className="w-full rounded-lg border border-border" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Adversarially Attacked (ε={epsilon}/255)
            </p>
            <img src={attackedImage} alt="Attacked" className="w-full rounded-lg border border-warning" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Original Confidence</p>
            <p className="text-2xl font-bold text-success">
              {originalResults.confidence.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Under Attack</p>
            <p className="text-2xl font-bold text-warning">
              {attackedResults.confidence.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Maintained Accuracy</p>
            <p className="text-2xl font-bold text-primary">
              {maintainedAccuracy.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Detection Performance Drop</span>
              <div className="flex items-center gap-2">
                {confidenceDrop > 15 ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-success" />
                )}
                <span className="text-sm font-bold">
                  {confidenceDrop.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.abs(confidenceDrop)} className="h-2" />
          </div>

          <div className={`p-4 rounded-lg border ${
            maintainedAccuracy >= 80 
              ? 'bg-success/5 border-success/30' 
              : maintainedAccuracy >= 60
              ? 'bg-warning/5 border-warning/30'
              : 'bg-destructive/5 border-destructive/30'
          }`}>
            <div className="flex items-start gap-3">
              {maintainedAccuracy >= 80 ? (
                <Shield className="w-5 h-5 text-success mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              )}
              <div>
                <p className="font-semibold mb-1">Robustness Assessment</p>
                <p className="text-sm text-muted-foreground">
                  {maintainedAccuracy >= 80 
                    ? `Excellent robustness! The model maintained ${maintainedAccuracy.toFixed(1)}% of its original confidence despite the ${attackType.toUpperCase()} adversarial attack with ε=${epsilon}/255.`
                    : maintainedAccuracy >= 60
                    ? `Good robustness. The model showed some resistance with ${maintainedAccuracy.toFixed(1)}% maintained accuracy under ${attackType.toUpperCase()} attack.`
                    : `The model's performance was significantly impacted, maintaining ${maintainedAccuracy.toFixed(1)}% accuracy. Consider using stronger adversarial training.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-primary/20">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            Original Detection
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Status</span>
              <Badge className={originalResults.isFake ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}>
                {originalResults.isFake ? "Fake" : "Authentic"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Type</span>
              <span className="text-sm font-semibold">{originalResults.manipulationType}</span>
            </div>
            {originalResults.features.slice(0, 3).map((feature: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{feature.name}</span>
                  <span className="text-xs">{feature.score.toFixed(1)}%</span>
                </div>
                <Progress value={feature.score} className="h-1" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-warning/20">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Under Attack Detection
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Status</span>
              <Badge className={attackedResults.isFake ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}>
                {attackedResults.isFake ? "Fake" : "Authentic"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Type</span>
              <span className="text-sm font-semibold">{attackedResults.manipulationType}</span>
            </div>
            {attackedResults.features.slice(0, 3).map((feature: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{feature.name}</span>
                  <span className="text-xs">{feature.score.toFixed(1)}%</span>
                </div>
                <Progress value={feature.score} className="h-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
