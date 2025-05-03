
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Artwork } from "@/types";
import { toast } from "sonner";

export const useFavorites = () => {
  const { currentUser } = useAuthStore();
  const [favorites, setFavorites] = useState<Artwork[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First get all favorite IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('artwork_id')
        .eq('user_id', currentUser.id);
      
      if (favoritesError) throw favoritesError;
      
      const ids = favoritesData.map(item => item.artwork_id);
      setFavoriteIds(ids);
      
      if (ids.length === 0) {
        setFavorites([]);
        return;
      }
      
      // Then get the artwork details for those IDs
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .in('id', ids);
        
      if (artworksError) throw artworksError;
      
      const formattedArtworks = artworksData.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        imageUrl: item.image_url,
        artistId: item.artist_id,
        category: item.category || 'Other',
        medium: item.medium || '',
        dimensions: item.dimensions || '',
        year: item.year || new Date().getFullYear(),
        likes: item.likes || 0,
        views: item.views || 0,
        tags: item.tags || [],
        createdAt: item.created_at,
        isForSale: item.is_for_sale || false,
        price: item.price?.toString() || '',
      }));
      
      setFavorites(formattedArtworks);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Failed to load favorites");
      toast.error("Failed to load your favorites");
    } finally {
      setLoading(false);
    }
  };
  
  const isFavorited = (artworkId: string): boolean => {
    return favoriteIds.includes(artworkId);
  };
  
  const toggleFavorite = async (artworkId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error("Please log in to manage favorites");
      return false;
    }
    
    try {
      if (isFavorited(artworkId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('artwork_id', artworkId);
          
        if (error) throw error;
        
        setFavoriteIds(prev => prev.filter(id => id !== artworkId));
        setFavorites(prev => prev.filter(artwork => artwork.id !== artworkId));
        toast.success("Removed from favorites");
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            artwork_id: artworkId
          });
          
        if (error) {
          if (error.code === '23505') { // Unique violation
            toast.error("Already in favorites");
            return true;
          }
          throw error;
        }
        
        // Get the artwork details
        const { data, error: artworkError } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', artworkId)
          .single();
          
        if (artworkError) throw artworkError;
        
        const artwork = {
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
        
        setFavoriteIds(prev => [...prev, artworkId]);
        setFavorites(prev => [...prev, artwork]);
        toast.success("Added to favorites");
        return true;
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites");
      return isFavorited(artworkId);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  return { 
    favorites, 
    favoriteIds,
    loading, 
    error,
    isFavorited,
    toggleFavorite,
    refreshFavorites: loadFavorites
  };
};
