
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export const useFollows = () => {
  const { currentUser } = useAuthStore();
  const [followedArtists, setFollowedArtists] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadFollowedArtists = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all artist IDs the user follows
      const { data, error: followsError } = await supabase
        .from('follows')
        .select('artist_id')
        .eq('follower_id', currentUser.id);
      
      if (followsError) throw followsError;
      
      const artistIds = data.map(item => item.artist_id);
      setFollowedArtists(artistIds);
    } catch (err) {
      console.error("Error loading followed artists:", err);
      setError("Failed to load followed artists");
    } finally {
      setLoading(false);
    }
  };
  
  const isFollowing = (artistId: string): boolean => {
    return followedArtists.includes(artistId);
  };
  
  const toggleFollow = async (artistId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error("Please log in to follow artists");
      return false;
    }
    
    try {
      if (isFollowing(artistId)) {
        // Unfollow the artist
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('artist_id', artistId);
          
        if (error) throw error;
        
        setFollowedArtists(prev => prev.filter(id => id !== artistId));
        toast.success("Artist unfollowed");
        return false;
      } else {
        // Follow the artist
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            artist_id: artistId
          });
          
        if (error) throw error;
        
        setFollowedArtists(prev => [...prev, artistId]);
        toast.success("Artist followed");
        return true;
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error("Failed to update follow status");
      return isFollowing(artistId);
    }
  };
  
  const getFollowerCount = async (artistId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('artist_id', artistId);
        
      if (error) throw error;
      
      return count || 0;
    } catch (err) {
      console.error("Error getting follower count:", err);
      return 0;
    }
  };

  useEffect(() => {
    loadFollowedArtists();
  }, [currentUser]);

  return { 
    followedArtists, 
    loading, 
    error,
    isFollowing,
    toggleFollow,
    getFollowerCount,
    refreshFollows: loadFollowedArtists
  };
};
