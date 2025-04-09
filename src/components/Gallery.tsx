
import { useEffect, useState } from "react";
import { useGalleryStore } from "@/lib/store";
import GalleryControls from "./gallery/GalleryControls";
import GalleryFilters from "./gallery/GalleryFilters";
import GalleryViews from "./gallery/GalleryViews";
import EmptyGalleryState from "./gallery/EmptyGalleryState";
import { useSortedArtworks } from "@/hooks/useSortedArtworks";

const Gallery = () => {
  const { 
    filteredArtworks, 
    getArtworks, 
    clearFilters
  } = useGalleryStore();
  
  const [viewMode, setViewMode] = useState<"grid" | "feed">("feed");
  const { sortedArtworks, sortBy, setSortBy } = useSortedArtworks(filteredArtworks);
  
  useEffect(() => {
    // Initialize gallery data
    getArtworks();
  }, [getArtworks]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <GalleryControls 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        
        <GalleryFilters />
      </div>
      
      {filteredArtworks.length === 0 ? (
        <EmptyGalleryState onResetFilters={clearFilters} />
      ) : (
        <GalleryViews 
          viewMode={viewMode} 
          artworks={sortedArtworks} 
        />
      )}
    </div>
  );
};

export default Gallery;
