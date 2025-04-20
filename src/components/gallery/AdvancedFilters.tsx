
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/lib/store";
import { X, Sliders } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdvancedFilters = () => {
  const { 
    setFilters, 
    clearFilters, 
    filters,
    artworks
  } = useGalleryStore();
  
  // Extract unique values from artworks for filter options
  const categories = [...new Set(artworks.map(a => a.category))].filter(Boolean);
  const mediums = [...new Set(artworks.map(a => a.medium))].filter(Boolean);
  const allTags = [...new Set(artworks.flatMap(a => a.tags))].filter(Boolean);
  
  // Local state for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  
  // Find max price in artworks
  const maxPrice = Math.max(...artworks.map(a => Number(a.price) || 0), 1000);
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    setFilters({ minPrice: value[0], maxPrice: value[1] });
  };
  
  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    setFilters({ tags: newSelectedTags.length > 0 ? newSelectedTags : undefined });
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Sliders className="mr-2 h-4 w-4" />
          Advanced Filters
        </h3>
        {(filters.category || filters.medium || filters.tags?.length > 0 || 
          filters.minPrice || filters.maxPrice) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.category || ""}
              onValueChange={(value) => setFilters({ category: value || undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="medium">
          <AccordionTrigger>Medium</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.medium || ""}
              onValueChange={(value) => setFilters({ medium: value || undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Mediums</SelectItem>
                {mediums.map((medium) => (
                  <SelectItem key={medium} value={medium}>
                    {medium}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, maxPrice]}
                max={maxPrice}
                step={10}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="tags">
          <AccordionTrigger>Tags</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {allTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AdvancedFilters;
