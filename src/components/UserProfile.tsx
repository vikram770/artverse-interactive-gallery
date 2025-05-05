
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtworkCard from "./ArtworkCard";
import { Artwork } from "@/types";
import { Heart, Image, MessageSquare, PlusCircle, LogOut, Bookmark, Users, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGalleryStore, useAuthStore } from "@/lib/store";
import FavoritesGallery from "./favorites/FavoritesGallery";
import FollowingList from "./following/FollowingList";
import { useFollows } from "@/hooks/useFollows";

const UserProfile = () => {
  const navigate = useNavigate();
  const { getArtworksByArtist, getUserLikedArtworks } = useGalleryStore();
  const { logout, currentUser } = useAuthStore();
  const { followedArtists } = useFollows();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  useEffect(() => {
    // Check current authentication status
    const checkUser = async () => {
      try {
        setLoading(true);
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                username: currentUser.username || currentUser.email?.split('@')[0],
                role: currentUser.role || 'visitor'
              });
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast.error("Error creating your profile");
            } else {
              // Try fetching again after creation
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
                
              if (newProfile) {
                setProfile(newProfile);
              }
            }
          } else {
            toast.error("Error fetching your profile");
          }
        } else if (profileData) {
          setProfile(profileData);
          
          const userRole = profileData.role;
          if (userRole === "artist" || userRole === "admin") {
            console.log("Fetching artworks for artist:", currentUser.id);
            // Load user's artworks
            const artistWorks = await getArtworksByArtist(currentUser.id);
            console.log("Artist works:", artistWorks);
            setUserArtworks(artistWorks);
          }
          
          // Get liked artworks
          const likedIds = await getUserLikedArtworks(currentUser.id);
          
          if (likedIds.length > 0) {
            // Fetch artwork details for each liked artwork
            const { data: likedArtworksData } = await supabase
              .from('artworks')
              .select('*')
              .in('id', likedIds);
              
            if (likedArtworksData) {
              const liked = likedArtworksData.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description || '',
                imageUrl: item.image_url,
                artistId: item.artist_id,
                category: item.category || 'Other',
                medium: item.medium || '',
                dimensions: item.dimensions || '',
                year: item.year || new Date().getFullYear(),
                likes: item.likes || 0,
                views: item.views || 0,
                tags: item.tags || [],
                createdAt: item.created_at,
                isForSale: item.is_for_sale || false,
                price: item.price?.toString() || '',
              }));
              setLikedArtworks(liked);
            }
          }
          
          // Get favorites count
          const { count, error: countError } = await supabase
            .from('favorites')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
            
          if (!countError && count !== null) {
            setFavoritesCount(count);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, getArtworksByArtist, getUserLikedArtworks, currentUser]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }
  
  if (!currentUser || !profile) {
    return <div className="py-12 text-center">Please log in to view your profile.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.avatar} alt={profile?.username} />
            <AvatarFallback className="text-2xl">
              {profile?.username?.slice(0, 2).toUpperCase() || currentUser?.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{profile?.username || currentUser?.email}</h1>
            <p className="text-gray-500 mb-2">
              {profile?.role === "artist" ? "Artist" : "Art Enthusiast"}
            </p>
            
            {profile?.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center">
                <Heart className="mr-2 h-4 w-4 text-gray-500" />
                <span>{likedArtworks.length} Likes</span>
              </div>
              
              <div className="flex items-center">
                <Bookmark className="mr-2 h-4 w-4 text-gray-500" />
                <span>{favoritesCount} Favorites</span>
              </div>
              
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                <span>{followedArtists.length} Following</span>
              </div>
              
              {profile?.role === "artist" && (
                <div className="flex items-center">
                  <Image className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{userArtworks.length} Artworks</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {profile?.role === "artist" && (
                <>
                  <Button 
                    onClick={() => navigate("/upload")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload New Artwork
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/dashboard")}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Artist Dashboard
                  </Button>
                </>
              )}
              
              <Button variant="outline" onClick={() => navigate("/profile/edit")}>
                Edit Profile
              </Button>
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={profile?.role === "artist" ? "uploaded" : "favorites"}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            {(profile?.role === "artist" || profile?.role === "admin") && (
              <TabsTrigger value="uploaded">My Artworks</TabsTrigger>
            )}
          </TabsList>
          
          <FavoritesGallery />
          <FollowingList />
          
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
          
          {(profile?.role === "artist" || profile?.role === "admin") && (
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
