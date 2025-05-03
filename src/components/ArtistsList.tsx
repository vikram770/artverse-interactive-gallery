
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGalleryStore } from "@/lib/store";
import { Users } from "lucide-react";
import FollowButton from "./buttons/FollowButton";
import { supabase } from "@/integrations/supabase/client";
import { useFollows } from "@/hooks/useFollows";

// Define a simpler interface for artist profiles from the database
interface ArtistProfile {
  id: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  role: string;
  email?: string;
  artworks: string[];
  createdAt: string;
}

const ArtistsList = () => {
  const { artworks } = useGalleryStore();
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const { getFollowerCount } = useFollows();
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Load artists from Supabase
    const loadArtists = async () => {
      try {
        // Get all profiles with role 'artist'
        const { data: artistProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'artist');
        
        if (error) throw error;
        
        if (artistProfiles) {
          // Map artists to include their artwork counts
          const artistsWithData: ArtistProfile[] = artistProfiles.map((artist: any) => {
            const artistArtworks = artworks.filter(
              artwork => artwork.artistId === artist.id
            );
            
            return {
              id: artist.id,
              username: artist.username || 'Unknown Artist',
              avatar: artist.avatar,
              bio: artist.bio,
              role: artist.role,
              artworks: artistArtworks.map(art => art.id),
              createdAt: artist.created_at
            };
          });
          
          // Sort by artwork count (most prolific first)
          artistsWithData.sort((a, b) => b.artworks.length - a.artworks.length);
          
          setArtists(artistsWithData);
          
          // Load follower counts for each artist
          const counts: Record<string, number> = {};
          for (const artist of artistsWithData) {
            counts[artist.id] = await getFollowerCount(artist.id);
          }
          setFollowerCounts(counts);
        }
      } catch (err) {
        console.error("Error loading artists:", err);
      }
    };
    
    loadArtists();
  }, [artworks, getFollowerCount]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-8">Featured Artists</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <Link to={`/artist/${artist.id}`} key={artist.id} className="group">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={artist.avatar || undefined} alt={artist.username || undefined} />
                  <AvatarFallback className="text-lg">
                    {artist.username ? artist.username.slice(0, 2).toUpperCase() : 'AR'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold group-hover:text-gallery-accent transition-colors">
                    {artist.username}
                  </h2>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{artist.artworks.length} {artist.artworks.length === 1 ? 'artwork' : 'artworks'}</span>
                    <span className="mx-1">•</span>
                    <Users className="h-3 w-3" />
                    <span>{followerCounts[artist.id] || 0} {followerCounts[artist.id] === 1 ? 'follower' : 'followers'}</span>
                  </div>
                </div>
                
                <div onClick={(e) => e.preventDefault()}>
                  <FollowButton artistId={artist.id} />
                </div>
              </div>
              
              {artist.bio && (
                <p className="text-gray-700 mb-4 line-clamp-3">{artist.bio}</p>
              )}
              
              {artist.artworks.length > 0 && (
                <div className="flex gap-2 overflow-hidden">
                  {artworks
                    .filter(artwork => artist.artworks.includes(artwork.id))
                    .slice(0, 3)
                    .map(artwork => (
                      <div 
                        key={artwork.id} 
                        className="w-1/3 aspect-square rounded-md overflow-hidden bg-gray-100"
                      >
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  }
                  
                  {artist.artworks.length > 3 && (
                    <div className="w-1/3 aspect-square rounded-md bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">+{artist.artworks.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {artists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No artists found.</p>
        </div>
      )}
    </div>
  );
};

export default ArtistsList;
