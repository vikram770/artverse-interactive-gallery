
import { useState } from "react";
import { useGalleryStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useGalleryStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };
  
  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Input
        type="text"
        placeholder="Search artworks, artists, or tags..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="pr-10"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

export default SearchBar;
