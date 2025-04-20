
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
  const { toggleLike, getUserLikedArtworks } = useGalleryStore();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [artistName, setArtistName] = useState("Unknown Artist");
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
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
    
    // Check like status
    const checkLikeStatus = async () => {
      if (currentUser) {
        const likedArtworks = await getUserLikedArtworks(currentUser.id);
        setIsLiked(likedArtworks.includes(artwork.id));
      }
    };
    
    fetchArtistName();
    checkLikeStatus();
  }, [artwork.artistId, artwork.id, currentUser, getUserLikedArtworks]);
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(artwork.id);
    // Toggle local state for immediate UI feedback
    setIsLiked(!isLiked);
  };
  
  const handleCommentClick = async () => {
    setLoading(true);
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('artwork_id', artwork.id)
        .order('created_at', { ascending: false });
        
      if (commentsError) throw commentsError;
      
      // Fetch user data for each comment
      const formattedComments = await Promise.all((commentsData || []).map(async (comment) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar')
          .eq('id', comment.user_id)
          .single();
          
        return {
          id: comment.id,
          artworkId: comment.artwork_id,
          userId: comment.user_id,
          text: comment.text,
          createdAt: comment.created_at,
          user: !userError && userData ? {
            username: userData.username || 'Anonymous',
            avatar: userData.avatar
          } : undefined
        };
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
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Fetch user profile for the comment
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar')
          .eq('id', currentUser.id)
          .single();
          
        const newComment = {
          id: data.id,
          artworkId: data.artwork_id,
          userId: data.user_id,
          text: data.text,
          createdAt: data.created_at,
          user: !userError && userData ? {
            username: userData.username || 'Anonymous',
            avatar: userData.avatar
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
