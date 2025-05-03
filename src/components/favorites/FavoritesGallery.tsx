
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import ArtworkCard from "@/components/ArtworkCard";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const FavoritesGallery = () => {
  const { favorites, loading, error, refreshFavorites } = useFavorites();

  useEffect(() => {
    refreshFavorites();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-200 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refreshFavorites}>Try Again</Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No favorite artworks yet</h3>
        <p className="text-gray-500 mb-4">
          Explore the gallery and save artworks you love.
        </p>
        <Link to="/">
          <Button>Explore Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <TabsContent value="favorites" className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </TabsContent>
  );
};

export default FavoritesGallery;
