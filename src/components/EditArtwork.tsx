
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGalleryStore } from "@/lib/store";
import UploadArtwork from "./UploadArtwork";
import { Artwork } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
          // Try to use the store function first
          let foundArtwork = await getArtworkById(id);
          
          // If not found, try direct fetch as fallback
          if (!foundArtwork) {
            const { data, error } = await supabase
              .from('artworks')
              .select('*')
              .eq('id', id)
              .single();
              
            if (error) throw error;
            
            if (data) {
              foundArtwork = {
                id: data.id,
                title: data.title,
                description: data.description || '',
                imageUrl: data.image_url,
                artistId: data.artist_id,
                category: data.category || 'Other',
                medium: data.medium || '',
                dimensions: data.dimensions || '',
                year: data.year || new Date().getFullYear(),
                likes: data.likes || 0,
                views: data.views || 0,
                tags: data.tags || [],
                createdAt: data.created_at,
                isForSale: data.is_for_sale || false,
                price: data.price?.toString() || '',
              };
            }
          }
          
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
