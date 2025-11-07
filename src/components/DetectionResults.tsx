import { Shield, AlertTriangle, Clock, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface DetectionResultsProps {
  results: {
    confidence: number;
    isFake: boolean;
    manipulationType: string;
    analysisTime: string;
    features: Array<{ name: string; score: number }>;
  };
}

export const DetectionResults = ({ results }: DetectionResultsProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="p-6 border-primary/20 shadow-card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Detection Results</h3>
        {results.isFake ? (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Fake Detected
          </Badge>
        ) : (
          <Badge className="bg-success/20 text-success border-success/30">
            <Shield className="w-3 h-3 mr-1" />
            Authentic
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Detection Confidence</span>
            <span className={`text-sm font-bold ${getConfidenceColor(results.confidence)}`}>
              {results.confidence.toFixed(1)}%
            </span>
          </div>
          <Progress value={results.confidence} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Type</span>
            </div>
            <p className="font-semibold">{results.manipulationType}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Analysis Time</span>
            </div>
            <p className="font-semibold">{results.analysisTime}s</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Feature Analysis</h4>
          <div className="space-y-3">
            {results.features.map((feature, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{feature.name}</span>
                  <span className="text-xs font-medium">{feature.score.toFixed(1)}%</span>
                </div>
                <Progress value={feature.score} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Analysis performed using ForensicFace++ trained models with adversarial attack resistance.
            Results are indicative and should be verified through multiple methods for critical applications.
          </p>
        </div>
      </div>
    </Card>
  );
};
