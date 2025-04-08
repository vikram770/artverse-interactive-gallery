
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Artist, Artwork } from "@/types";
import { useGalleryStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ArtworkCard from "./ArtworkCard";
import { Link, Facebook, Instagram, Twitter } from "lucide-react";

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getArtworksByArtist } = useGalleryStore();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistArtworks, setArtistArtworks] = useState<Artwork[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    // Load artist from localStorage
    const loadArtist = () => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const foundArtist = storedUsers.find((user: Artist) => user.id === id && user.role === 'artist');
      
      if (foundArtist) {
        setArtist(foundArtist);
        
        // Get artist's artworks
        const artworks = getArtworksByArtist(id);
        setArtistArtworks(artworks);
      } else {
        // Artist not found, redirect to 404
        navigate("/not-found", { replace: true });
      }
    };
    
    loadArtist();
  }, [id, getArtworksByArtist, navigate]);
  
  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading artist...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <Avatar className="w-24 h-24">
            <AvatarImage src={artist.avatar} alt={artist.username} />
            <AvatarFallback className="text-2xl">
              {artist.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{artist.username}</h1>
            <p className="text-gray-500 mb-4">Artist</p>
            
            {artist.bio && (
              <p className="text-gray-700 mb-6">{artist.bio}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              {artist.socialLinks?.instagram && (
                <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gallery-accent">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              
              {artist.socialLinks?.twitter && (
                <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gallery-accent">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              
              {artist.socialLinks?.facebook && (
                <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gallery-accent">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gallery-accent flex items-center">
                  <Link className="h-5 w-5 mr-1" /> Website
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6">Artworks by {artist.username}</h2>
          
          {artistArtworks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">This artist hasn't uploaded any artworks yet.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {artistArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;
