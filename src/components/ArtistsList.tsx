
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Artist, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGalleryStore } from "@/lib/store";

const ArtistsList = () => {
  const { artworks } = useGalleryStore();
  const [artists, setArtists] = useState<Artist[]>([]);
  
  useEffect(() => {
    // Load artists from localStorage
    const loadArtists = () => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const artistUsers = storedUsers.filter((user: User) => user.role === 'artist');
      
      // Map artists to include their artwork counts
      const artistsWithArtworks = artistUsers.map((artist: Artist) => {
        const artistArtworks = artworks.filter(
          artwork => artwork.artistId === artist.id
        );
        
        return {
          ...artist,
          artworks: artistArtworks.map(art => art.id)
        };
      });
      
      // Sort by artwork count (most prolific first)
      artistsWithArtworks.sort((a: Artist, b: Artist) => 
        b.artworks.length - a.artworks.length
      );
      
      setArtists(artistsWithArtworks);
    };
    
    loadArtists();
  }, [artworks]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-8">Featured Artists</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <Link to={`/artist/${artist.id}`} key={artist.id} className="group">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={artist.avatar} alt={artist.username} />
                  <AvatarFallback className="text-lg">
                    {artist.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-semibold group-hover:text-gallery-accent transition-colors">
                    {artist.username}
                  </h2>
                  <p className="text-gray-500">{artist.artworks.length} {artist.artworks.length === 1 ? 'artwork' : 'artworks'}</p>
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
