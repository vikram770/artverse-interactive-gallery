
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGalleryStore } from "@/lib/store";
import UploadArtwork from "./UploadArtwork";

const EditArtwork = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getArtworkById } = useGalleryStore();
  const [artwork, setArtwork] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const foundArtwork = getArtworkById(id);
      
      if (foundArtwork) {
        setArtwork(foundArtwork);
      } else {
        // Artwork not found, redirect to 404
        navigate("/not-found", { replace: true });
      }
    }
  }, [id, getArtworkById, navigate]);
  
  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return <UploadArtwork artworkToEdit={artwork} />;
};

export default EditArtwork;
