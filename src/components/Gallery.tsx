
import { useEffect, useState } from "react";
import { useGalleryStore } from "@/lib/store";
import GalleryControls from "./gallery/GalleryControls";
import GalleryFilters from "./gallery/GalleryFilters";
import GalleryViews from "./gallery/GalleryViews";
import EmptyGalleryState from "./gallery/EmptyGalleryState";
import AdvancedFilters from "./gallery/AdvancedFilters";
import { useSortedArtworks } from "@/hooks/useSortedArtworks";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const Gallery = () => {
  const { 
    filteredArtworks, 
    getArtworks, 
    clearFilters
  } = useGalleryStore();
  
  const [viewMode, setViewMode] = useState<"grid" | "feed">("feed");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { sortedArtworks, sortBy, setSortBy } = useSortedArtworks(filteredArtworks);
  
  useEffect(() => {
    // Initialize gallery data
    getArtworks();
  }, [getArtworks]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <GalleryControls 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showAdvancedFilters ? "Hide Advanced Filters" : "Advanced Filters"}
          </Button>
        </div>
        
        <GalleryFilters />
        
        {showAdvancedFilters && <AdvancedFilters />}
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
