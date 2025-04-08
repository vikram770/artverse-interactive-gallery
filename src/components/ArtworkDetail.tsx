
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGalleryStore, useAuthStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Share2, Eye, MessageSquare, Edit, Trash2, Maximize2, Minimize2 } from "lucide-react";
import CommentList from "./CommentList";

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { 
    getArtworkById, 
    getCommentsByArtworkId, 
    addComment, 
    toggleLike,
    deleteArtwork,
  } = useGalleryStore();
  
  const [artwork, setArtwork] = useState(id ? getArtworkById(id) : undefined);
  const [comments, setComments] = useState(id ? getCommentsByArtworkId(id) : []);
  const [newComment, setNewComment] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  
  const isLiked = currentUser?.likedArtworks.includes(id || "") || false;
  const isOwner = currentUser?.id === artwork?.artistId;
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwner || isAdmin;
  
  useEffect(() => {
    if (id) {
      const foundArtwork = getArtworkById(id);
      setArtwork(foundArtwork);
      
      if (foundArtwork) {
        setComments(getCommentsByArtworkId(id));
      } else {
        // Artwork not found, redirect to 404
        navigate("/not-found", { replace: true });
      }
    }
  }, [id, getArtworkById, getCommentsByArtworkId, navigate]);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !newComment.trim()) return;
    
    addComment({
      artworkId: id,
      text: newComment
    });
    
    setNewComment("");
    setComments(getCommentsByArtworkId(id));
  };
  
  const handleLike = () => {
    if (id) {
      toggleLike(id);
      // Update local state to reflect the like change
      setArtwork(getArtworkById(id));
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork?.title,
        text: artwork?.description,
        url: window.location.href,
      }).catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };
  
  const handleDelete = () => {
    if (id && window.confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
      deleteArtwork(id);
      navigate("/", { replace: true });
    }
  };
  
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading artwork...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 ${isZoomed ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-4' : ''}`}>
          <div className={`relative ${isZoomed ? 'max-h-full max-w-full' : 'aspect-[4/3] rounded-lg overflow-hidden bg-gray-100'}`}>
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title} 
              className={`w-full h-full ${isZoomed ? 'object-contain' : 'object-cover'}`}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-4 right-4 bg-white/80 hover:bg-white"
              onClick={toggleZoom}
            >
              {isZoomed ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">{artwork.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{artwork.year}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{artwork.category}</Badge>
              <Badge variant="outline">{artwork.medium}</Badge>
              {artwork.dimensions && <Badge variant="outline">{artwork.dimensions}</Badge>}
            </div>
            
            <p className="text-gray-700 mb-6">{artwork.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {artwork.tags.map((tag) => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={handleLike}
              >
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-white" : ""}`} /> 
                {artwork.likes} {artwork.likes === 1 ? "Like" : "Likes"}
              </Button>
              
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              
              {canEdit && (
                <>
                  <Button variant="outline" onClick={() => navigate(`/edit/${artwork.id}`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center text-gray-500 space-x-6">
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4" /> {artwork.views} views
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" /> {comments.length} comments
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold font-display mb-4">Comments</h2>
            
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  placeholder="Leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </form>
            ) : (
              <p className="mb-6 text-gray-500">
                Please <a href="/login" className="text-blue-500 hover:underline">sign in</a> to leave a comment.
              </p>
            )}
            
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
