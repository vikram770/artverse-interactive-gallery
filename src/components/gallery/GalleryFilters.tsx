
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
    activeFilters,
    setFilter,
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
    setFilter("category", value);
  };

  const handleYearChange = (value: number | null) => {
    setFilter("year", value);
  };

  const hasActiveFilters = activeFilters.category || activeFilters.year;
  
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <CategoryFilter 
          selectedCategory={activeFilters.category} 
          categories={categories} 
          onChange={handleCategoryChange} 
        />
        
        <YearFilter 
          selectedYear={activeFilters.year?.toString() || null} 
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
          {activeFilters.category && (
            <FilterBadge
              label="Category"
              value={activeFilters.category}
              onRemove={() => setFilter("category", "")}
            />
          )}
          {activeFilters.year && (
            <FilterBadge
              label="Year"
              value={activeFilters.year}
              onRemove={() => setFilter("year", null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryFilters;
