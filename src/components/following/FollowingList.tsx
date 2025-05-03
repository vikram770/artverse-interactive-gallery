
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import FollowButton from "@/components/buttons/FollowButton";

interface ArtistProfile {
  id: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
}

const FollowingList = () => {
  const { followedArtists, loading, error, refreshFollows } = useFollows();
  const [artists, setArtists] = useState<ArtistProfile[]>([]);

  useEffect(() => {
    refreshFollows();
  }, []);
  
  useEffect(() => {
    const fetchFollowedArtists = async () => {
      if (followedArtists.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar, bio')
          .in('id', followedArtists);
          
        if (error) throw error;
        
        if (data) {
          setArtists(data);
        }
      } catch (err) {
        console.error("Error fetching followed artists:", err);
      }
    };
    
    fetchFollowedArtists();
  }, [followedArtists]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refreshFollows}>Try Again</Button>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Not following any artists yet</h3>
        <p className="text-gray-500 mb-4">
          Explore the gallery and follow artists whose work you appreciate.
        </p>
        <Link to="/artists">
          <Button>Explore Artists</Button>
        </Link>
      </div>
    );
  }

  return (
    <TabsContent value="following" className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {artists.map((artist) => (
          <Link key={artist.id} to={`/artist/${artist.id}`} className="block">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={artist.avatar || undefined} />
                <AvatarFallback>
                  {artist.username?.substring(0, 2).toUpperCase() || "AR"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{artist.username}</h3>
                {artist.bio && (
                  <p className="text-sm text-gray-500 line-clamp-1">{artist.bio}</p>
                )}
              </div>
              
              <FollowButton artistId={artist.id} />
            </div>
          </Link>
        ))}
      </div>
    </TabsContent>
  );
};

export default FollowingList;
