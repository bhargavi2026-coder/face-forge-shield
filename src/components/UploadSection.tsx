import { useState } from "react";
import { Upload, Image, Video, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { DetectionResults } from "./DetectionResults";

export const UploadSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      
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
      toast.success("Analysis complete");
    }, 3000);
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

          <div>
            {preview && (
              <Card className="p-4 border-primary/20 shadow-card mb-4">
                <h3 className="font-semibold mb-3">Preview</h3>
                {file?.type.startsWith("image/") ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </Card>
            )}

            {results && <DetectionResults results={results} />}
          </div>
        </div>
      </div>
    </section>
  );
};
