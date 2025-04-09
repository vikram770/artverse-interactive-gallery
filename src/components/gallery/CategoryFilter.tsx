
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onChange: (value: string) => void;
}

const CategoryFilter = ({ selectedCategory, categories, onChange }: CategoryFilterProps) => {
  return (
    <div className="w-full md:w-auto">
      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) => onChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;
