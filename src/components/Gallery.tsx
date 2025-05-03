
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
import { useFavorites } from "@/hooks/useFavorites";
import { Artwork } from "@/types";

const Gallery = () => {
  const { 
    filteredArtworks, 
    getArtworks, 
    clearFilters
  } = useGalleryStore();
  
  const [viewMode, setViewMode] = useState<"grid" | "feed">("feed");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { sortedArtworks, sortBy, setSortBy } = useSortedArtworks(filteredArtworks);
  const { favoriteIds } = useFavorites();
  
  useEffect(() => {
    // Initialize gallery data
    getArtworks();
  }, [getArtworks]);
  
  // Filter artworks by favorites if the option is selected
  const displayedArtworks: Artwork[] = showFavoritesOnly 
    ? sortedArtworks.filter(artwork => favoriteIds.includes(artwork.id))
    : sortedArtworks;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <GalleryControls 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
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
      
      {displayedArtworks.length === 0 ? (
        <EmptyGalleryState onResetFilters={() => {
          clearFilters();
          setShowFavoritesOnly(false);
        }} />
      ) : (
        <GalleryViews 
          viewMode={viewMode} 
          artworks={displayedArtworks} 
        />
      )}
    </div>
  );
};

export default Gallery;
