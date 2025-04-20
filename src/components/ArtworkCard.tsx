
import { useState, useEffect } from "react";
import { Artwork } from "@/types";
import { Link } from "react-router-dom";
import { Heart, Calendar, User } from "lucide-react";
import { useAuthStore, useGalleryStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  const { currentUser } = useAuthStore();
  const { getUserLikedArtworks, toggleLike } = useGalleryStore();
  
  const [isLiked, setIsLiked] = useState(false);
  const [artistName, setArtistName] = useState("Unknown Artist");
  
  useEffect(() => {
    // Check if user has liked this artwork
    const checkLikedStatus = async () => {
      if (currentUser) {
        const likedArtworks = await getUserLikedArtworks(currentUser.id);
        setIsLiked(likedArtworks.includes(artwork.id));
      }
    };
    
    // Get artist name
    const getArtistDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', artwork.artistId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setArtistName(data.username || "Unknown Artist");
        }
      } catch (error) {
        console.error("Error fetching artist details:", error);
      }
    };
    
    checkLikedStatus();
    getArtistDetails();
  }, [artwork.id, artwork.artistId, currentUser, getUserLikedArtworks]);
  
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleLike(artwork.id);
    
    // Update liked status
    if (currentUser) {
      const likedArtworks = await getUserLikedArtworks(currentUser.id);
      setIsLiked(likedArtworks.includes(artwork.id));
    }
  };
  
  // Calculate time since posting
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(artwork.createdAt), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  return (
    <Link to={`/artwork/${artwork.id}`} className="artwork-card group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
        <img 
          src={artwork.imageUrl} 
          alt={artwork.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="artwork-overlay opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/60 flex flex-col justify-between p-4 transition-opacity duration-200">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-white">{artwork.title}</h3>
          <p className="text-sm text-gray-200 mb-2 line-clamp-2">{artwork.description}</p>
          
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-white border-white/30">
              {artwork.category}
            </Badge>
            <button
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              onClick={handleLikeClick}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-gallery-dark text-base">{artwork.title}</h3>
        <div className="flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          <Link 
            to={`/artist/${artwork.artistId}`} 
            className="hover:text-gallery-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {artistName}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {getTimeAgo()}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {artwork.likes}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtworkCard;
