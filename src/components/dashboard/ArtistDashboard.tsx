
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Image, PlusCircle, BarChart, Users } from "lucide-react";
import ArtworksList from "./ArtworksList";
import DashboardStats from "./DashboardStats";
import { Artwork } from "@/types";

const ArtistDashboard = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalViews: 0,
    totalLikes: 0,
    totalFollowers: 0,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "artist" && currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const loadArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch artist's artworks
        const { data: artworksData, error: artworksError } = await supabase
          .from("artworks")
          .select("*")
          .eq("artist_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (artworksError) throw artworksError;

        if (artworksData) {
          const mappedArtworks = artworksData.map((item: any): Artwork => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            imageUrl: item.image_url,
            artistId: item.artist_id,
            category: item.category || "Other",
            medium: item.medium || "",
            dimensions: item.dimensions || "",
            year: item.year || new Date().getFullYear(),
            likes: item.likes || 0,
            views: item.views || 0,
            tags: item.tags || [],
            createdAt: item.created_at,
            isForSale: item.is_for_sale || false,
            price: item.price?.toString() || "",
          }));
          
          setArtworks(mappedArtworks);
          
          // Calculate statistics
          const totalViews = mappedArtworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0);
          const totalLikes = mappedArtworks.reduce((sum, artwork) => sum + (artwork.likes || 0), 0);
          
          // Get follower count
          const { count: followersCount, error: followersError } = await supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", currentUser.id);
            
          if (followersError) throw followersError;
          
          setStats({
            totalArtworks: mappedArtworks.length,
            totalViews,
            totalLikes,
            totalFollowers: followersCount || 0,
          });
        }
      } catch (err) {
        console.error("Error loading artist data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArtistData();
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="py-12 text-center">Loading your dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Artist Dashboard</h1>
        <Button 
          onClick={() => navigate("/upload")}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload New Artwork
        </Button>
      </div>

      <DashboardStats stats={stats} />
      
      <Tabs defaultValue="artworks" className="mt-8">
        <TabsList>
          <TabsTrigger value="artworks">My Artworks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="artworks" className="mt-6">
          <ArtworksList artworks={artworks} />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
                  Most Viewed Artworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artworks
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 5)
                  .map((artwork, index) => (
                    <div key={artwork.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center">
                        <span className="w-6 text-muted-foreground">{index + 1}.</span>
                        <span className="truncate max-w-[200px]">{artwork.title}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{artwork.views || 0}</span>
                      </div>
                    </div>
                  ))}
                {artworks.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No artworks uploaded yet</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
                  Most Liked Artworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artworks
                  .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                  .slice(0, 5)
                  .map((artwork, index) => (
                    <div key={artwork.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center">
                        <span className="w-6 text-muted-foreground">{index + 1}.</span>
                        <span className="truncate max-w-[200px]">{artwork.title}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{artwork.likes || 0}</span>
                      </div>
                    </div>
                  ))}
                {artworks.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No artworks uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;
