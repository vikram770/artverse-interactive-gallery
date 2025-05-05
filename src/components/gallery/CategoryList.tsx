import { Button } from "@/components/ui/button";
import { ARTWORK_CATEGORIES } from "@/constants/artwork";
import { useGalleryStore } from "@/lib/store";
import { useState } from "react";

const CategoryList = () => {
  const { filters, setFilters } = useGalleryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || "");

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      // If clicking the same category, clear the filter
      setSelectedCategory("");
      setFilters({ category: undefined });
    } else {
      // Otherwise set the new category
      setSelectedCategory(category);
      setFilters({ category: category });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-3">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {ARTWORK_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
