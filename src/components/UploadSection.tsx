import { useState } from "react";
import { Upload, Image, Video, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { DetectionResults } from "./DetectionResults";
import { AdversarialAttacks } from "./AdversarialAttacks";
import { ComparisonResults } from "./ComparisonResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const UploadSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [attackedImage, setAttackedImage] = useState<string | null>(null);
  const [attackedResults, setAttackedResults] = useState<any>(null);
  const [attackType, setAttackType] = useState<string>("");
  const [epsilon, setEpsilon] = useState<number>(0);
  const [showAttackOptions, setShowAttackOptions] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      setAttackedImage(null);
      setAttackedResults(null);
      setShowAttackOptions(false);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      toast.success("File uploaded successfully");
    }
  };

  const analyzeMedia = () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call your ML model via API)
    setTimeout(() => {
      const mockResults = {
        confidence: Math.random() * 100,
        isFake: Math.random() > 0.5,
        manipulationType: ["Face Swap", "DeepFake", "Face2Face", "NeuralTextures"][Math.floor(Math.random() * 4)],
        analysisTime: (Math.random() * 2 + 1).toFixed(2),
        features: [
          { name: "Facial Landmarks", score: Math.random() * 100 },
          { name: "Texture Consistency", score: Math.random() * 100 },
          { name: "Temporal Coherence", score: Math.random() * 100 },
          { name: "Compression Artifacts", score: Math.random() * 100 },
        ]
      };
      
      setResults(mockResults);
      setIsAnalyzing(false);
      setShowAttackOptions(true);
      toast.success("Analysis complete");
    }, 3000);
  };

  const handleAttackComplete = (attacked: string, type: string, eps: number) => {
    setAttackedImage(attacked);
    setAttackType(type);
    setEpsilon(eps);
    
    // Analyze the attacked image
    toast.info("Analyzing attacked image...");
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockAttackedResults = {
        confidence: Math.max(40, results.confidence - Math.random() * 30),
        isFake: results.isFake,
        manipulationType: results.manipulationType,
        analysisTime: (Math.random() * 2 + 1).toFixed(2),
        features: results.features.map((f: any) => ({
          ...f,
          score: Math.max(30, f.score - Math.random() * 25)
        }))
      };
      
      setAttackedResults(mockAttackedResults);
      setIsAnalyzing(false);
      toast.success("Attacked image analysis complete");
    }, 2500);
  };

  return (
    <section id="upload-section" className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upload Media for Analysis</h2>
          <p className="text-muted-foreground text-lg">
            Support for images (JPG, PNG) and videos (MP4, AVI)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 border-primary/20 shadow-card">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    or drag and drop your file here
                  </p>
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                  {file.type.startsWith("image/") ? (
                    <Image className="w-5 h-5 text-primary" />
                  ) : (
                    <Video className="w-5 h-5 text-primary" />
                  )}
                  <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={analyzeMedia}
                disabled={!file || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Media"}
              </Button>

              <div className="flex items-start gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Privacy Notice</p>
                  <p className="text-muted-foreground text-xs">
                    All uploads are processed securely and are not stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {preview && file?.type.startsWith("image/") && (
              <Card className="p-4 border-primary/20 shadow-card">
                <h3 className="font-semibold mb-3">Preview</h3>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
              </Card>
            )}

            {results && !attackedResults && <DetectionResults results={results} />}

            {results && showAttackOptions && !attackedImage && (
              <AdversarialAttacks
                originalImage={preview!}
                onAttackComplete={handleAttackComplete}
              />
            )}

            {attackedResults && preview && attackedImage && (
              <ComparisonResults
                originalResults={results}
                attackedResults={attackedResults}
                attackType={attackType}
                epsilon={epsilon}
                originalImage={preview}
                attackedImage={attackedImage}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
