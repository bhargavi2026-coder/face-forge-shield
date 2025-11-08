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
  const [isVideo, setIsVideo] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
      setAttackedImage(null);
      setAttackedResults(null);
      setShowAttackOptions(false);
      
      const fileIsVideo = selectedFile.type.startsWith('video/');
      setIsVideo(fileIsVideo);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      toast.success("File uploaded successfully");
    }
  };

  const extractVideoFrame = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        // Seek to middle of video for analysis
        video.currentTime = video.duration / 2;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg', 0.95);
        URL.revokeObjectURL(video.src);
        resolve(frameData);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to extract video frame'));
      };
      
      video.src = URL.createObjectURL(videoFile);
      video.load();
    });
  };

  const analyzeMedia = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      let imageDataToAnalyze = preview;
      
      // For videos, extract a middle frame
      if (isVideo) {
        toast.info("Extracting video frame for analysis...");
        imageDataToAnalyze = await extractVideoFrame(file);
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-deepfake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageData: imageDataToAnalyze,
            isVideo 
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Detection failed');
      }

      const analysisResults = await response.json();
      console.log('Analysis results:', analysisResults);
      
      setResults(analysisResults);
      setIsAnalyzing(false);
      setShowAttackOptions(true);
      toast.success("Analysis complete");
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    }
  };

  const applyAdversarialNoise = (imageData: string, epsilon: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;
        
        // Apply random noise within epsilon range
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * epsilon;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
        }
        
        ctx.putImageData(imageDataObj, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageData;
    });
  };

  const handleAttackComplete = async (attacked: string, type: string, eps: number) => {
    setAttackedImage(attacked);
    setAttackType(type);
    setEpsilon(eps);
    
    // Analyze the attacked image with real backend
    toast.info("Analyzing attacked image...");
    setIsAnalyzing(true);
    
    try {
      // Apply adversarial noise to the image
      const attackedImageData = await applyAdversarialNoise(preview!, eps);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-deepfake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageData: attackedImageData,
            isVideo: false 
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze attacked image');
      }

      const mockAttackedResults = await response.json();
      
      setAttackedResults(mockAttackedResults);
      setAttackedImage(attackedImageData);
      setIsAnalyzing(false);
      toast.success("Attacked image analysis complete");
    } catch (error) {
      console.error('Adversarial attack error:', error);
      setIsAnalyzing(false);
      toast.error("Adversarial attack failed. Please try again.");
    }
  };

  return (
    <section id="upload-section" className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upload Media for Analysis</h2>
          <p className="text-muted-foreground text-lg">
            Support for images (JPG, PNG) and videos (MP4, AVI, MOV)
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
            {preview && (
              <Card className="p-4 border-primary/20 shadow-card">
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
