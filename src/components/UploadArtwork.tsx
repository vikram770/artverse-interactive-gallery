
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGalleryStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Image } from "lucide-react";

const categories = [
  "Painting",
  "Sculpture",
  "Photography",
  "Digital Art",
  "Mixed Media",
  "Drawing",
  "Printmaking",
  "Installation",
  "Performance",
  "Video",
  "Other"
];

const UploadArtwork = ({ artworkToEdit }: { artworkToEdit?: any }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addArtwork, updateArtwork } = useGalleryStore();
  
  const isEditMode = !!artworkToEdit;
  
  const [formData, setFormData] = useState({
    title: artworkToEdit?.title || "",
    description: artworkToEdit?.description || "",
    category: artworkToEdit?.category || "",
    medium: artworkToEdit?.medium || "",
    dimensions: artworkToEdit?.dimensions || "",
    year: artworkToEdit?.year || new Date().getFullYear(),
    tags: artworkToEdit?.tags?.join(", ") || "",
    imageUrl: artworkToEdit?.imageUrl || "",
    isForSale: artworkToEdit?.isForSale || false,
    price: artworkToEdit?.price || "",
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(artworkToEdit?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  
  // Check if user is authorized to upload
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  
  if (currentUser.role !== "artist" && currentUser.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Permission Denied</h1>
        <p className="mb-6">Only artists can upload artworks.</p>
        <Button onClick={() => navigate("/")}>Return to Gallery</Button>
      </div>
    );
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
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
          setFormData({ ...formData, imageUrl: result });
          setUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.category || !formData.imageUrl) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const artwork = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [],
      year: parseInt(formData.year.toString()),
      isForSale: formData.isForSale,
      price: formData.isForSale ? formData.price : "",
    };
    
    if (isEditMode) {
      updateArtwork(artworkToEdit.id, artwork);
      toast.success("Artwork updated successfully");
      navigate(`/artwork/${artworkToEdit.id}`);
    } else {
      addArtwork(artwork);
      toast.success("Artwork uploaded successfully");
      navigate("/profile");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Edit Artwork" : "Upload Artwork"}
      </h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  required
                  min={1900}
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input
                id="medium"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                placeholder="e.g., Oil on Canvas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 24 x 36 inches"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., abstract, nature, modern"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isForSale"
                  checked={formData.isForSale}
                  onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isForSale">This artwork is for sale</Label>
              </div>
              
              {formData.isForSale && (
                <div className="mt-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Artwork Image *</Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      or
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, imageUrl: e.target.value });
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
                        setFormData({ ...formData, imageUrl: "" });
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
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(isEditMode ? `/artwork/${artworkToEdit.id}` : "/")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={uploading || !formData.imageUrl}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isEditMode ? "Save Changes" : "Upload Artwork"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadArtwork;
