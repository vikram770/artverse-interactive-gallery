
import { useEffect, useState } from "react";
import { useGalleryStore } from "@/lib/store";
import ArtworkCard from "./ArtworkCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const Gallery = () => {
  const { 
    filteredArtworks, 
    artworks, 
    getArtworks, 
    activeFilters,
    setFilter,
    clearFilters
  } = useGalleryStore();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  useEffect(() => {
    // Initialize gallery data
    getArtworks();
    
    // Extract unique categories and years
    const uniqueCategories = [...new Set(artworks.map(art => art.category))] as string[];
    const uniqueYears = [...new Set(artworks.map(art => art.year))] as number[];
    
    // Sort years in descending order
    uniqueYears.sort((a, b) => b - a);
    
    setCategories(uniqueCategories);
    setYears(uniqueYears);
  }, [artworks.length, getArtworks]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-6">Explore Artworks</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="w-full md:w-auto">
            <Select
              value={activeFilters.category || ""}
              onValueChange={(value) => setFilter("category", value || "")}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Select
              value={activeFilters.year?.toString() || ""}
              onValueChange={(value) => setFilter("year", value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(activeFilters.category || activeFilters.year) && (
            <Button variant="ghost" onClick={clearFilters} className="flex items-center text-gray-500">
              <X className="mr-1 h-4 w-4" /> Clear Filters
            </Button>
          )}
        </div>
        
        {(activeFilters.category || activeFilters.year) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeFilters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {activeFilters.category}
                <button 
                  onClick={() => setFilter("category", "")}
                  className="ml-1 hover:text-gray-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeFilters.year && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Year: {activeFilters.year}
                <button 
                  onClick={() => setFilter("year", null)}
                  className="ml-1 hover:text-gray-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">No artworks found matching your filters.</p>
          <Button onClick={clearFilters}>Reset Filters</Button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
