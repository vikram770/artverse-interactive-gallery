
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Artwork, Comment } from "@/types";
import { useAuthStore, useGalleryStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ArtworkFeedItemProps {
  artwork: Artwork;
}

const ArtworkFeedItem = ({ artwork }: ArtworkFeedItemProps) => {
  const { currentUser } = useAuthStore();
  const { toggleLike, getCommentsByArtworkId, addComment } = useGalleryStore();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  
  const isLiked = currentUser?.likedArtworks.includes(artwork.id) || false;
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(artwork.id);
  };
  
  // Find the artist username
  const getArtistName = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const artist = storedUsers.find((user: any) => user.id === artwork.artistId);
    return artist ? artist.username : "Unknown Artist";
  };
  
  // Get artist avatar
  const getArtistAvatar = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const artist = storedUsers.find((user: any) => user.id === artwork.artistId);
    return artist?.avatar;
  };
  
  // Calculate time since posting
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(artwork.createdAt), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  const handleCommentClick = () => {
    const artworkComments = getCommentsByArtworkId(artwork.id);
    setComments(artworkComments);
    setShowComments(!showComments);
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    addComment({
      artworkId: artwork.id,
      text: newComment
    });
    
    setNewComment("");
    // Refresh comments
    setComments(getCommentsByArtworkId(artwork.id));
  };
  
  return (
    <Card className="border rounded-md overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Link to={`/artist/${artwork.artistId}`} onClick={(e) => e.stopPropagation()}>
            <Avatar>
              <AvatarImage src={getArtistAvatar()} />
              <AvatarFallback>{getArtistName().slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link 
              to={`/artist/${artwork.artistId}`} 
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {getArtistName()}
            </Link>
            <p className="text-xs text-gray-500">{getTimeAgo()}</p>
          </div>
        </div>
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
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-6 w-6 text-gray-700" />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Share2 className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
        
        <div className="mb-2">
          <p className="font-medium text-sm">{artwork.likes} likes</p>
        </div>
        
        <div className="mb-2">
          <Link 
            to={`/artist/${artwork.artistId}`} 
            className="font-medium mr-2"
            onClick={(e) => e.stopPropagation()}
          >
            {getArtistName()}
          </Link>
          <span className="text-sm">{artwork.title}</span>
        </div>
        
        <div className="mb-2">
          <p className="text-sm text-gray-700 line-clamp-2">{artwork.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {artwork.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto text-gray-500 text-sm"
          onClick={handleCommentClick}
        >
          View all {comments.length || "..."} comments
        </Button>
      </CardContent>
      
      {showComments && (
        <>
          <Separator />
          <div className="px-4 py-2 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {currentUser && (
        <CardFooter className="p-3 border-t">
          <form onSubmit={handleSubmitComment} className="w-full flex items-center gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-0 h-9 py-2 resize-none"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              disabled={!newComment.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  );
};

// Comment subcomponent
const CommentItem = ({ comment }: { comment: Comment }) => {
  const [username, setUsername] = useState<string>("Loading...");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  
  useState(() => {
    // Get user info
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find((u: any) => u.id === comment.userId);
    
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar);
    } else {
      setUsername("Unknown User");
    }
  });
  
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  return (
    <div className="flex gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-1">
          <Link to={`/artist/${comment.userId}`} className="text-sm font-medium">
            {username}
          </Link>
          <p className="text-sm break-words">{comment.text}</p>
        </div>
        <p className="text-xs text-gray-500">{getTimeAgo()}</p>
      </div>
    </div>
  );
};

export default ArtworkFeedItem;

