
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoriteButtonProps {
  artworkId: string;
  alreadyFavorited?: boolean;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const FavoriteButton = ({
  artworkId,
  alreadyFavorited = false,
  iconOnly = false,
  size = "md",
  variant = "ghost"
}: FavoriteButtonProps) => {
  const { currentUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState<boolean>(alreadyFavorited);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if artwork is already in user's favorites
    if (currentUser && !alreadyFavorited) {
      const checkFavoriteStatus = async () => {
        try {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('artwork_id', artworkId)
            .single();
          
          setIsFavorite(!!data);
        } catch (error) {
          // Not in favorites or error, leave as false
          console.log('Not in favorites:', error);
        }
      };
      
      checkFavoriteStatus();
    } else {
      setIsFavorite(alreadyFavorited);
    }
  }, [artworkId, currentUser, alreadyFavorited]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Please log in to add to favorites");
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('artwork_id', artworkId);

        if (error) throw error;
        
        toast.success("Removed from favorites");
        setIsFavorite(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            artwork_id: artworkId
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast.error("Already in your favorites");
          } else {
            throw error;
          }
        } else {
          toast.success("Added to favorites");
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm": return "p-1 h-auto";
      case "lg": return "p-3 h-auto";
      default: return "p-2 h-auto";
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={`${getButtonSize()} ${iconOnly ? '' : 'flex gap-2'}`}
      onClick={handleToggleFavorite}
      disabled={loading}
    >
      {isFavorite ? (
        <BookmarkCheck className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} ${isFavorite ? "fill-primary text-primary" : ""}`} />
      ) : (
        <Bookmark className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
      )}
      {!iconOnly && (isFavorite ? "Saved" : "Save")}
    </Button>
  );
};

export default FavoriteButton;
