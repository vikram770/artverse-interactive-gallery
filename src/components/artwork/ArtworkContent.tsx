
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ArtworkContentProps {
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  tags: string[];
}

const ArtworkContent = ({ 
  title, 
  description, 
  artistId, 
  artistName, 
  tags 
}: ArtworkContentProps) => {
  return (
    <div>
      <div className="mb-2">
        <Link 
          to={`/artist/${artistId}`} 
          className="font-medium mr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {artistName}
        </Link>
        <span className="text-sm">{title}</span>
      </div>
      
      <div className="mb-2">
        <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
        ))}
      </div>
    </div>
  );
};

export default ArtworkContent;
