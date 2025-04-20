
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAuthStore, useGalleryStore } from "@/lib/store";

interface ArtworkActionsProps {
  isLiked?: boolean;
  onLikeClick?: (e: React.MouseEvent) => void;
  onCommentClick?: () => void;
  likesCount?: number;
  artworkId?: string;
}

const ArtworkActions = ({ 
  isLiked: propIsLiked, 
  onLikeClick: propOnLikeClick, 
  onCommentClick, 
  likesCount: propLikesCount,
  artworkId
}: ArtworkActionsProps) => {
  const { currentUser } = useAuthStore();
  const { getUserLikedArtworks, toggleLike } = useGalleryStore();
  
  const [isLiked, setIsLiked] = useState(propIsLiked || false);
  const [likesCount, setLikesCount] = useState(propLikesCount || 0);
  
  useEffect(() => {
    if (artworkId && currentUser) {
      const checkLikeStatus = async () => {
        const likedArtworks = await getUserLikedArtworks(currentUser.id);
        setIsLiked(likedArtworks.includes(artworkId));
      };
      
      checkLikeStatus();
    }
  }, [artworkId, currentUser, getUserLikedArtworks]);
  
  // If external values are provided, update our state
  useEffect(() => {
    if (propIsLiked !== undefined) setIsLiked(propIsLiked);
    if (propLikesCount !== undefined) setLikesCount(propLikesCount);
  }, [propIsLiked, propLikesCount]);
  
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (propOnLikeClick) {
      propOnLikeClick(e);
    } else if (artworkId) {
      await toggleLike(artworkId);
      
      // Update the like status and count
      if (currentUser) {
        const likedArtworks = await getUserLikedArtworks(currentUser.id);
        const newIsLiked = likedArtworks.includes(artworkId);
        setIsLiked(newIsLiked);
        
        // Update likes count (increment or decrement based on new status)
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      }
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={handleLikeClick}
        >
          <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={onCommentClick}
        >
          <MessageCircle className="h-6 w-6 text-gray-700" />
        </Button>
        
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <Share2 className="h-6 w-6 text-gray-700" />
        </Button>
      </div>
      
      <div className="mb-2">
        <p className="font-medium text-sm">{likesCount} likes</p>
      </div>
    </div>
  );
};

export default ArtworkActions;
