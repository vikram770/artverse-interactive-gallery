
import { Button } from "@/components/ui/button";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { Bookmark } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryControlsProps {
  viewMode: "grid" | "feed";
  setViewMode: (mode: "grid" | "feed") => void;
  sortBy: string;
  setSortBy: (option: string) => void;
  showFavoritesOnly?: boolean;
  setShowFavoritesOnly?: (show: boolean) => void;
}

const GalleryControls = ({ 
  viewMode, 
  setViewMode, 
  sortBy, 
  setSortBy,
  showFavoritesOnly = false,
  setShowFavoritesOnly
}: GalleryControlsProps) => {
  const { currentUser } = useAuthStore();
  const { favoriteIds } = useFavorites();
  const hasFavorites = currentUser && favoriteIds.length > 0;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewMode("grid")}
          className="h-9 w-9"
        >
          <Grid className="h-4 w-4" />
          <span className="sr-only">Grid view</span>
        </Button>
        
        <Button
          variant={viewMode === "feed" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewMode("feed")}
          className="h-9 w-9"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Feed view</span>
        </Button>
        
        {currentUser && setShowFavoritesOnly && (
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            disabled={!hasFavorites}
            className={`flex items-center gap-1 ${!hasFavorites ? 'opacity-50' : ''}`}
          >
            <Bookmark className={`h-4 w-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            <span>Favorites</span>
          </Button>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden md:inline">Sort By</span>
            <span className="text-xs text-gray-500 hidden md:inline">: {sortBy}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSortBy("newest")}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("oldest")}>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("popular")}>
            Most Popular
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("title_asc")}>
            Title (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("title_desc")}>
            Title (Z-A)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GalleryControls;
