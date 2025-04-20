
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ArtworkContentProps {
  title?: string;
  description?: string;
  artistId?: string;
  artistName?: string;
  tags?: string[];
  artwork?: any; // For compatibility with existing code
}

const ArtworkContent = ({ 
  title: propTitle, 
  description: propDescription, 
  artistId: propArtistId, 
  artistName: propArtistName, 
  tags: propTags,
  artwork
}: ArtworkContentProps) => {
  // Extract props from artwork object if provided
  const title = propTitle || artwork?.title;
  const description = propDescription || artwork?.description;
  const artistId = propArtistId || artwork?.artistId;
  const artistName = propArtistName || artwork?.artist?.username || "Unknown Artist";
  const tags = propTags || artwork?.tags || [];
  
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
        {tags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
        ))}
      </div>
    </div>
  );
};

export default ArtworkContent;
