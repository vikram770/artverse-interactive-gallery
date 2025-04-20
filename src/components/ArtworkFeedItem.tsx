
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Artwork, Comment } from "@/types";
import { useAuthStore, useGalleryStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ArtworkHeader from "./artwork/ArtworkHeader";
import ArtworkActions from "./artwork/ArtworkActions";
import ArtworkContent from "./artwork/ArtworkContent";
import CommentSection from "./comments/CommentSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ArtworkFeedItemProps {
  artwork: Artwork;
}

const ArtworkFeedItem = ({ artwork }: ArtworkFeedItemProps) => {
  const { currentUser } = useAuthStore();
  const { likeArtwork } = useGalleryStore();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [artistName, setArtistName] = useState("Unknown Artist");
  const [loading, setLoading] = useState(false);
  
  const isLiked = false; // This would need to be determined from user's liked artworks
  
  useEffect(() => {
    // Find the artist username
    const fetchArtistName = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', artwork.artistId)
          .single();
        
        if (data && !error) {
          setArtistName(data.username);
        }
      } catch (error) {
        console.error("Error fetching artist name:", error);
      }
    };
    
    fetchArtistName();
  }, [artwork.artistId]);
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeArtwork(artwork.id);
  };
  
  const handleCommentClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar)
        `)
        .eq('artwork_id', artwork.id);
        
      if (error) throw error;
      
      // Format comments
      const formattedComments = data.map(comment => ({
        id: comment.id,
        artworkId: comment.artwork_id,
        userId: comment.user_id,
        text: comment.text,
        createdAt: comment.created_at,
        user: comment.profiles ? {
          username: comment.profiles.username || 'Anonymous',
          avatar: comment.profiles.avatar
        } : undefined
      }));
      
      setComments(formattedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = async (text: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          artwork_id: artwork.id,
          user_id: currentUser.id,
          text
        })
        .select(`
          *,
          profiles:user_id (username, avatar)
        `)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newComment = {
          id: data.id,
          artworkId: data.artwork_id,
          userId: data.user_id,
          text: data.text,
          createdAt: data.created_at,
          user: data.profiles ? {
            username: data.profiles.username || 'Anonymous',
            avatar: data.profiles.avatar
          } : undefined
        };
        
        setComments([newComment, ...comments]);
        toast.success("Comment added");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
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
        
        {loading ? (
          <div className="py-2 text-center">
            <p className="text-sm text-gray-500">Loading comments...</p>
          </div>
        ) : (
          <CommentSection 
            artworkId={artwork.id}
            currentUser={currentUser}
            comments={comments}
            onAddComment={handleAddComment}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ArtworkFeedItem;
