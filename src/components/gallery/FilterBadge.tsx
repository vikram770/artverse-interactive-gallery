
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterBadgeProps {
  label: string;
  value: string | number;
  onRemove: () => void;
}

const FilterBadge = ({ label, value, onRemove }: FilterBadgeProps) => {
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {label}: {value}
      <button 
        onClick={onRemove}
        className="ml-1 hover:text-gray-800"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};

export default FilterBadge;
