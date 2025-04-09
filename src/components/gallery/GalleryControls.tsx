
import { Link } from "react-router-dom";
import { Box, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "@/hooks/useSortedArtworks";

interface GalleryControlsProps {
  viewMode: "grid" | "feed";
  setViewMode: (mode: "grid" | "feed") => void;
  sortBy: SortOption;
  setSortBy: (sort: string) => void;
}

const GalleryControls = ({ 
  viewMode, 
  setViewMode, 
  sortBy,
  setSortBy 
}: GalleryControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h1 className="text-3xl font-bold font-display">Explore Artworks</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex rounded-md overflow-hidden border">
          <Button 
            variant={viewMode === "feed" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("feed")}
            className="rounded-none px-3"
          >
            Feed
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-none px-3"
          >
            Grid
          </Button>
        </div>
        
        <div className="w-full md:w-auto">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value)}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Link to="/gallery3d">
          <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
            <Box size={18} />
            View in 3D Gallery
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GalleryControls;
