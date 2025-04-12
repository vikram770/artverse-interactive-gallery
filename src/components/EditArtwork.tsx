
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGalleryStore } from "@/lib/store";
import UploadArtwork from "./UploadArtwork";
import { Artwork } from "@/types";

const EditArtwork = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getArtworkById } = useGalleryStore();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const fetchArtwork = async () => {
        try {
          setLoading(true);
          const foundArtwork = await getArtworkById(id);
          
          if (foundArtwork) {
            setArtwork(foundArtwork);
          } else {
            // Artwork not found, redirect to 404
            navigate("/not-found", { replace: true });
          }
        } catch (error) {
          console.error("Error fetching artwork:", error);
          navigate("/not-found", { replace: true });
        } finally {
          setLoading(false);
        }
      };
      
      fetchArtwork();
    }
  }, [id, getArtworkById, navigate]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Artwork not found</p>
      </div>
    );
  }
  
  return <UploadArtwork artworkToEdit={artwork} />;
};

export default EditArtwork;
