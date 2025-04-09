
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useGalleryStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtworkCard from "./ArtworkCard";
import { Artwork } from "@/types";
import { Heart, Image, MessageSquare, PlusCircle } from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { getArtworksByArtist, artworks } = useGalleryStore();
  
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (currentUser.role === "artist" || currentUser.role === "admin") {
      const artistWorks = getArtworksByArtist(currentUser.id);
      setUserArtworks(artistWorks);
    }
    
    // Get liked artworks
    const userLikes = currentUser.likedArtworks || [];
    const liked = artworks.filter(artwork => userLikes.includes(artwork.id));
    setLikedArtworks(liked);
    
  }, [currentUser, getArtworksByArtist, artworks, navigate]);
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
            <AvatarFallback className="text-2xl">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{currentUser.username}</h1>
            <p className="text-gray-500 mb-2">
              {currentUser.role === "artist" ? "Artist" : "Art Enthusiast"}
            </p>
            
            {currentUser.bio && (
              <p className="text-gray-700 mb-4">{currentUser.bio}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center">
                <Heart className="mr-2 h-4 w-4 text-gray-500" />
                <span>{currentUser.likedArtworks?.length || 0} Likes</span>
              </div>
              
              {currentUser.role === "artist" && (
                <div className="flex items-center">
                  <Image className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{userArtworks.length} Artworks</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {currentUser.role === "artist" && (
                <Button 
                  onClick={() => navigate("/upload")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload New Artwork
                </Button>
              )}
              
              <Button variant="outline" onClick={() => navigate("/profile/edit")}>
                Edit Profile
              </Button>
              
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={currentUser.role === "artist" ? "uploaded" : "liked"}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="liked">Liked Artworks</TabsTrigger>
            {(currentUser.role === "artist" || currentUser.role === "admin") && (
              <TabsTrigger value="uploaded">My Artworks</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="liked" className="py-6">
            {likedArtworks.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No liked artworks yet</h3>
                <p className="text-gray-500 mb-4">
                  Explore the gallery and like artworks you appreciate.
                </p>
                <Button onClick={() => navigate("/")}>Explore Gallery</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {likedArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {(currentUser.role === "artist" || currentUser.role === "admin") && (
            <TabsContent value="uploaded" className="py-6">
              {userArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No artworks uploaded yet</h3>
                  <p className="text-gray-500 mb-4">
                    Share your creative work with the world.
                  </p>
                  <Button 
                    onClick={() => navigate("/upload")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload Artwork
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Artwork Gallery</h2>
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/upload")}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {userArtworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
