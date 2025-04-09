
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtworkHeaderProps {
  artistId: string;
  createdAt: string;
}

const ArtworkHeader = ({ artistId, createdAt }: ArtworkHeaderProps) => {
  const [artistName, setArtistName] = useState("Loading...");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Get user info
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const artist = storedUsers.find((user: any) => user.id === artistId);
    
    if (artist) {
      setArtistName(artist.username);
      setAvatar(artist.avatar);
    } else {
      setArtistName("Unknown Artist");
    }
  }, [artistId]);
  
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <Link to={`/artist/${artistId}`} onClick={(e) => e.stopPropagation()}>
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>{artistName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div>
        <Link 
          to={`/artist/${artistId}`} 
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {artistName}
        </Link>
        <p className="text-xs text-gray-500">{getTimeAgo()}</p>
      </div>
    </div>
  );
};

export default ArtworkHeader;
