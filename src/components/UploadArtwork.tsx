
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGalleryStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ArtworkForm from "./artwork/ArtworkForm";
import ArtworkImageUploader from "./artwork/ArtworkImageUploader";
import { Artwork } from "@/types";

interface UploadArtworkProps {
  artworkToEdit?: Artwork;
}

const UploadArtwork = ({ artworkToEdit }: UploadArtworkProps) => {
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
    
    if (isEditMode && artworkToEdit) {
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
          <ArtworkForm 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          <div className="space-y-6">
            <ArtworkImageUploader 
              imageUrl={formData.imageUrl}
              setImageUrl={(url) => setFormData({...formData, imageUrl: url})}
              uploading={uploading}
              setUploading={setUploading}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(isEditMode && artworkToEdit ? `/artwork/${artworkToEdit.id}` : "/")}
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
