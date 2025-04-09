
import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";

interface ArtworkImageUploaderProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

const ArtworkImageUploader = ({ 
  imageUrl, 
  setImageUrl, 
  uploading, 
  setUploading 
}: ArtworkImageUploaderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      // Simulate upload with a delay
      setUploading(true);
      
      // In a real app with Supabase, we'd upload to storage here
      // For now, we'll use a local URL for demo purposes
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Simulate network delay
        setTimeout(() => {
          setImagePreview(result);
          setImageUrl(result);
          setUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="image">Artwork Image *</Label>
      
      <div 
        className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed border-gray-300'} rounded-lg p-6 text-center transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!imagePreview ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Image size={48} />
            </div>
            <div className="text-gray-600">
              <Label
                htmlFor="image"
                className="cursor-pointer text-primary hover:text-primary/80 inline-flex items-center"
              >
                <Upload className="mr-1 h-4 w-4" />
                Upload artwork image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
              <p className="text-sm mt-2">
                or drag and drop your file here
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              or
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full aspect-square object-contain rounded"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={() => {
                setImagePreview(null);
                setImageUrl("");
              }}
            >
              Change
            </Button>
          </div>
        )}
        
        {uploading && (
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-2/3"></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Uploading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworkImageUploader;
