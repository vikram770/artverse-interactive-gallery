
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Artwork } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit } from "lucide-react";
import PaymentButton from "./PaymentButton";
import ArtworkActions from "./artwork/ArtworkActions";
import ArtworkContent from "./artwork/ArtworkContent";
import ArtworkHeader from "./artwork/ArtworkHeader";
import CommentSection from "./comments/CommentSection";
import { toast } from "sonner";
import ArtworkZoom from "./artwork/ArtworkZoom";
import ShareButtons from "./social/ShareButtons";
import RelatedArtworks from "./artwork/RelatedArtworks";

interface ArtistInfo {
  username: string;
  avatar?: string;
}

interface ArtworkWithArtist extends Artwork {
  artist?: ArtistInfo;
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [artwork, setArtwork] = useState<ArtworkWithArtist | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArtwork = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch artwork details
        const { data: artworkData, error: artworkError } = await supabase
          .from('artworks')
          .select(`
            *,
            profiles:artist_id (username, avatar)
          `)
          .eq('id', id)
          .single();
          
        if (artworkError) throw artworkError;
        
        if (artworkData) {
          // Update view count
          const { error: viewError } = await supabase
            .from('artworks')
            .update({ views: (artworkData.views || 0) + 1 })
            .eq('id', id);
            
          if (viewError) console.error("Error updating view count:", viewError);
          
          // Format artwork data with proper typing
          const formattedArtwork: ArtworkWithArtist = {
            id: artworkData.id,
            title: artworkData.title,
            description: artworkData.description || '',
            imageUrl: artworkData.image_url,
            artistId: artworkData.artist_id,
            category: artworkData.category || 'Other',
            medium: artworkData.medium || '',
            dimensions: artworkData.dimensions || '',
            year: artworkData.year || new Date().getFullYear(),
            likes: artworkData.likes || 0,
            views: (artworkData.views || 0) + 1, // Increment locally
            tags: artworkData.tags || [],
            createdAt: artworkData.created_at,
            isForSale: artworkData.is_for_sale || false,
            price: artworkData.price?.toString() || '',
          };
          
          // Add artist info if available
          if (artworkData.profiles) {
            formattedArtwork.artist = {
              username: artworkData.profiles.username || 'Unknown Artist',
              avatar: artworkData.profiles.avatar
            };
          }
          
          setArtwork(formattedArtwork);
          
          // Fetch comments
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (username, avatar)
            `)
            .eq('artwork_id', id)
            .order('created_at', { ascending: false });
            
          if (commentsError) throw commentsError;
          
          setComments(commentsData || []);
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
        toast.error("Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtwork();
  }, [id]);
  
  const handleAddComment = async (text: string) => {
    if (!currentUser || !artwork) return;
    
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
        setComments([data, ...comments]);
        toast.success("Comment added");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Artwork not found</h2>
        <p className="mb-6">The artwork you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    );
  }
  
  const formattedComments = comments.map(comment => ({
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
  
  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative rounded-lg overflow-hidden border bg-white shadow-sm">
          <div className="aspect-square">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <ArtworkZoom imageUrl={artwork.imageUrl} title={artwork.title} />
            <ShareButtons 
              artworkId={artwork.id} 
              title={artwork.title} 
              imageUrl={artwork.imageUrl} 
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <ArtworkHeader artwork={artwork as any} />
          
          <ArtworkContent artwork={artwork as any} />
          
          <div className="flex justify-between items-center">
            <ArtworkActions artwork={artwork as any} />
            
            {currentUser?.id === artwork.artistId && (
              <Button variant="outline" onClick={() => navigate(`/edit/${artwork.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Artwork
              </Button>
            )}
          </div>
          
          {artwork.isForSale && (
            <div className="mt-6 p-6 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-bold mb-4">Purchase this artwork</h3>
              <p className="mb-6 text-gray-600">
                This original artwork is available for purchase. Secure checkout with various payment options.
              </p>
              <PaymentButton artworkId={artwork.id} price={parseFloat(artwork.price || "0")} />
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <CommentSection
            artworkId={artwork.id}
            currentUser={currentUser}
            comments={formattedComments}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
      
      <RelatedArtworks currentArtwork={artwork} />
      
      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
};

export default ArtworkDetail;
