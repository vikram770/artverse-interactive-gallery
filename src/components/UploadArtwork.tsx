
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
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(artworkToEdit?.imageUrl || null);
  
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
      // In a real app, we'd upload to a server here
      // For our demo, we'll use a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
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
    };
    
    if (isEditMode) {
      updateArtwork(artworkToEdit.id, artwork);
      navigate(`/artwork/${artworkToEdit.id}`);
    } else {
      addArtwork(artwork);
      navigate("/");
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
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Artwork Image *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />
              
              {!imagePreview && !isEditMode && (
                <p className="text-sm text-gray-500">
                  OR
                </p>
              )}
              
              {(!imagePreview && !isEditMode) && (
                <div className="space-y-2 mt-2">
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
              )}
              
              {imagePreview && (
                <div className="mt-4 aspect-square max-h-80 overflow-hidden rounded-md bg-gray-100">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
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
          <Button type="submit">
            {isEditMode ? "Save Changes" : "Upload Artwork"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadArtwork;
