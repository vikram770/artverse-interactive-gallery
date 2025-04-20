
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/lib/store";
import CategoryFilter from "./CategoryFilter";
import YearFilter from "./YearFilter";
import FilterBadge from "./FilterBadge";

const GalleryFilters = () => {
  const { 
    artworks, 
    filters,
    setFilters,
    clearFilters
  } = useGalleryStore();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  useEffect(() => {
    // Extract unique categories and years
    const uniqueCategories = [...new Set(artworks.map(art => art.category))] as string[];
    const uniqueYears = [...new Set(artworks.map(art => art.year))] as number[];
    
    // Sort years in descending order
    uniqueYears.sort((a, b) => b - a);
    
    setCategories(uniqueCategories);
    setYears(uniqueYears);
  }, [artworks]);
  
  const handleCategoryChange = (value: string) => {
    setFilters({ category: value || undefined });
  };

  const handleYearChange = (value: number | null) => {
    setFilters({ year: value || undefined });
  };

  const hasActiveFilters = filters.category || filters.year;
  
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <CategoryFilter 
          selectedCategory={filters.category || ""} 
          categories={categories} 
          onChange={handleCategoryChange} 
        />
        
        <YearFilter 
          selectedYear={filters.year?.toString() || null} 
          years={years} 
          onChange={handleYearChange} 
        />
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center text-gray-500">
            <X className="mr-1 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.category && (
            <FilterBadge
              label="Category"
              value={filters.category}
              onRemove={() => setFilters({ category: undefined })}
            />
          )}
          {filters.year && (
            <FilterBadge
              label="Year"
              value={filters.year}
              onRemove={() => setFilters({ year: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryFilters;
