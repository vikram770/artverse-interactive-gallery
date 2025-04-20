
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface ArtworkHeaderProps {
  artistId: string;
  createdAt: string;
}

const ArtworkHeader = ({ artistId, createdAt }: ArtworkHeaderProps) => {
  const [artistName, setArtistName] = useState("Loading...");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar')
          .eq('id', artistId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setArtistName(data.username || "Unknown Artist");
          setAvatar(data.avatar);
        }
      } catch (error) {
        console.error("Error fetching artist info:", error);
        setArtistName("Unknown Artist");
      }
    };
    
    fetchArtistInfo();
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
