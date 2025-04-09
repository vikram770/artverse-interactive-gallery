
import { useState, useMemo } from "react";
import { Artwork } from "@/types";

export type SortOption = "newest" | "oldest" | "popular";

export function useSortedArtworks(artworks: Artwork[]) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  
  const sortedArtworks = useMemo(() => {
    return [...artworks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "popular":
          return b.likes - a.likes;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [artworks, sortBy]);

  const handleSortChange = (value: string) => {
    // Type assertion to convert string to SortOption, only valid sort options allowed
    if (value === "newest" || value === "oldest" || value === "popular") {
      setSortBy(value);
    }
  };

  return { sortedArtworks, sortBy, setSortBy: handleSortChange };
}
