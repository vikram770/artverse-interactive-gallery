
import { useEffect, useState } from "react";
import { useGalleryStore } from "@/lib/store";
import GalleryControls from "./gallery/GalleryControls";
import GalleryFilters from "./gallery/GalleryFilters";
import GalleryViews from "./gallery/GalleryViews";
import EmptyGalleryState from "./gallery/EmptyGalleryState";
import AdvancedFilters from "./gallery/AdvancedFilters";
import { useSortedArtworks } from "@/hooks/useSortedArtworks";
import { Button } from "@/components/ui/button";
import { Filter, UsersRound } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useFollows } from "@/hooks/useFollows";
import { Artwork } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryList from "./gallery/CategoryList";

const Gallery = () => {
  const { 
    filteredArtworks, 
    getArtworks, 
    clearFilters
  } = useGalleryStore();
  
  const { currentUser } = useAuthStore();
  const [viewMode, setViewMode] = useState<"grid" | "feed">("feed");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFollowedArtists, setShowFollowedArtists] = useState(false);
  const { sortedArtworks, sortBy, setSortBy } = useSortedArtworks(filteredArtworks);
  const { favoriteIds } = useFavorites();
  const { followedArtists } = useFollows();
  const [currentTab, setCurrentTab] = useState<"all" | "following" | "favorites">("all");
  
  useEffect(() => {
    // Initialize gallery data
    getArtworks();
  }, [getArtworks]);
  
  // Filter artworks by favorites or followed artists if the options are selected
  const getDisplayedArtworks = (): Artwork[] => {
    if (currentTab === "favorites") {
      return sortedArtworks.filter(artwork => favoriteIds.includes(artwork.id));
    } else if (currentTab === "following" && followedArtists.length > 0) {
      return sortedArtworks.filter(artwork => followedArtists.includes(artwork.artistId));
    }
    return sortedArtworks;
  };
  
  const displayedArtworks = getDisplayedArtworks();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="w-full">
            {currentUser && (
              <Tabs 
                value={currentTab} 
                onValueChange={(value) => setCurrentTab(value as "all" | "following" | "favorites")}
                className="w-full mb-4"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="all">All Artworks</TabsTrigger>
                  <TabsTrigger 
                    value="following" 
                    disabled={!currentUser || followedArtists.length === 0}
                  >
                    Following
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites" 
                    disabled={!currentUser || favoriteIds.length === 0}
                  >
                    Favorites
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <GalleryControls 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
          
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
        
        <CategoryList />
        
        <GalleryFilters />
        
        {showAdvancedFilters && <AdvancedFilters />}
      </div>
      
      {displayedArtworks.length === 0 ? (
        <EmptyGalleryState onResetFilters={() => {
          clearFilters();
          setCurrentTab("all");
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
