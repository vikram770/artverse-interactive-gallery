
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Artwork } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedArtworksProps {
  currentArtwork: Artwork;
}

const RelatedArtworks = ({ currentArtwork }: RelatedArtworksProps) => {
  const navigate = useNavigate();
  const [related, setRelated] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        
        // Fetch based on tags, category, or artist
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .or(`category.eq.${currentArtwork.category},artist_id.eq.${currentArtwork.artistId}`)
          .neq('id', currentArtwork.id)
          .limit(10);
          
        if (error) throw error;
        
        if (data) {
          // Map DB structure to app structure
          const artworks = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            imageUrl: item.image_url,
            artistId: item.artist_id,
            category: item.category || 'Other',
            medium: item.medium || '',
            dimensions: item.dimensions || '',
            year: item.year || new Date().getFullYear(),
            likes: item.likes || 0,
            views: item.views || 0,
            tags: item.tags || [],
            createdAt: item.created_at,
            isForSale: item.is_for_sale || false,
            price: item.price?.toString() || '',
          }));
          
          setRelated(artworks);
        }
      } catch (error) {
        console.error("Error fetching related artworks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentArtwork) {
      fetchRelated();
    }
  }, [currentArtwork]);
  
  if (loading) {
    return <div className="py-4">Loading related artworks...</div>;
  }
  
  if (related.length === 0) {
    return null;
  }
  
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">You might also like</h3>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {related.map((artwork) => (
            <CarouselItem key={artwork.id} className="md:basis-1/3 lg:basis-1/4">
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/artwork/${artwork.id}`)}
              >
                <CardContent className="p-0">
                  <AspectRatio ratio={3/4} className="bg-muted">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <div className="p-3">
                    <h4 className="font-medium line-clamp-1">{artwork.title}</h4>
                    <p className="text-sm text-gray-500">
                      {artwork.medium}, {artwork.year}
                    </p>
                    {artwork.isForSale && (
                      <p className="text-sm font-semibold mt-1">${artwork.price}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default RelatedArtworks;
