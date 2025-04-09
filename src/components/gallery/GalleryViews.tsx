
import { Artwork } from "@/types";
import ArtworkFeedItem from "../ArtworkFeedItem";
import ArtworkCard from "../ArtworkCard";

interface GalleryViewsProps {
  viewMode: "grid" | "feed";
  artworks: Artwork[];
}

const GalleryViews = ({ viewMode, artworks }: GalleryViewsProps) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {artworks.map((artwork) => (
        <ArtworkFeedItem key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
};

export default GalleryViews;
