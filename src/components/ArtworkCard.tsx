
import { Artwork } from "@/types";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuthStore, useGalleryStore } from "@/lib/store";

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  const { currentUser } = useAuthStore();
  const { toggleLike } = useGalleryStore();
  
  const isLiked = currentUser?.likedArtworks.includes(artwork.id) || false;
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(artwork.id);
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
        
        <div className="artwork-overlay">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{artwork.title}</h3>
          <p className="text-sm text-gray-200 mb-2 line-clamp-2">{artwork.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">{artwork.category}</span>
            <button
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              onClick={handleLikeClick}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-medium text-gallery-dark">{artwork.title}</h3>
        <p className="text-sm text-gray-500">{artwork.year}</p>
      </div>
    </Link>
  );
};

export default ArtworkCard;
