
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Artwork } from "@/types";
import { useAuthStore, useGalleryStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ArtworkHeader from "./artwork/ArtworkHeader";
import ArtworkActions from "./artwork/ArtworkActions";
import ArtworkContent from "./artwork/ArtworkContent";
import CommentSection from "./comments/CommentSection";

interface ArtworkFeedItemProps {
  artwork: Artwork;
}

const ArtworkFeedItem = ({ artwork }: ArtworkFeedItemProps) => {
  const { currentUser } = useAuthStore();
  const { toggleLike, getCommentsByArtworkId, addComment } = useGalleryStore();
  
  const [comments, setComments] = useState([]);
  const [artistName, setArtistName] = useState("Unknown Artist");
  
  const isLiked = currentUser?.likedArtworks.includes(artwork.id) || false;
  
  useEffect(() => {
    // Find the artist username
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const artist = storedUsers.find((user: any) => user.id === artwork.artistId);
    if (artist) {
      setArtistName(artist.username);
    }
  }, [artwork.artistId]);
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(artwork.id);
  };
  
  const handleCommentClick = () => {
    const artworkComments = getCommentsByArtworkId(artwork.id);
    setComments(artworkComments);
  };
  
  const handleAddComment = (text: string) => {
    addComment({
      artworkId: artwork.id,
      text: text
    });
    
    // Refresh comments
    setComments(getCommentsByArtworkId(artwork.id));
  };
  
  return (
    <Card className="border rounded-md overflow-hidden">
      <CardHeader className="p-4">
        <ArtworkHeader 
          artistId={artwork.artistId} 
          createdAt={artwork.createdAt} 
        />
      </CardHeader>
      
      <div className="aspect-square w-full relative">
        <Link to={`/artwork/${artwork.id}`}>
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Link>
      </div>
      
      <CardContent className="p-4">
        <ArtworkActions 
          isLiked={isLiked} 
          onLikeClick={handleLikeClick} 
          onCommentClick={handleCommentClick}
          likesCount={artwork.likes} 
        />
        
        <ArtworkContent 
          title={artwork.title}
          description={artwork.description}
          artistId={artwork.artistId}
          artistName={artistName}
          tags={artwork.tags}
        />
        
        <CommentSection 
          artworkId={artwork.id}
          currentUser={currentUser}
          comments={comments}
          onAddComment={handleAddComment}
        />
      </CardContent>
    </Card>
  );
};

export default ArtworkFeedItem;
