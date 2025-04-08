
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARTWORK_CATEGORIES } from "@/constants/artwork";

interface ArtworkFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    medium: string;
    dimensions: string;
    year: number;
    tags: string;
    isForSale: boolean;
    price: string;
  };
  setFormData: (data: any) => void;
}

const ArtworkForm = ({ formData, setFormData }: ArtworkFormProps) => {
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={handleFormChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          rows={5}
          value={formData.description}
          onChange={handleFormChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {ARTWORK_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            required
            min={1900}
            max={new Date().getFullYear()}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="medium">Medium</Label>
        <Input
          id="medium"
          value={formData.medium}
          onChange={handleFormChange}
          placeholder="e.g., Oil on Canvas"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dimensions">Dimensions</Label>
        <Input
          id="dimensions"
          value={formData.dimensions}
          onChange={handleFormChange}
          placeholder="e.g., 24 x 36 inches"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={handleFormChange}
          placeholder="e.g., abstract, nature, modern"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isForSale"
            checked={formData.isForSale}
            onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isForSale">This artwork is for sale</Label>
        </div>
        
        {formData.isForSale && (
          <div className="mt-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="Enter price"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworkForm;
