
import { Button } from "@/components/ui/button";

interface EmptyGalleryStateProps {
  onResetFilters: () => void;
}

const EmptyGalleryState = ({ onResetFilters }: EmptyGalleryStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-lg text-gray-500 mb-4">No artworks found matching your filters.</p>
      <Button onClick={onResetFilters}>Reset Filters</Button>
    </div>
  );
};

export default EmptyGalleryState;
