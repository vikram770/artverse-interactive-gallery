
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Artwork } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Edit, Link } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArtworksListProps {
  artworks: Artwork[];
}

const ArtworksList = ({ artworks }: ArtworksListProps) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const handleSort = (column: "date" | "views" | "likes") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };
  
  const sortedArtworks = [...artworks].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    
    if (sortBy === "date") {
      return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "views") {
      return multiplier * ((a.views || 0) - (b.views || 0));
    } else {
      return multiplier * ((a.likes || 0) - (b.likes || 0));
    }
  });
  
  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };
  
  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500 mb-4">You haven't uploaded any artworks yet.</p>
        <Button 
          onClick={() => navigate("/upload")}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          Upload Your First Artwork
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSort("date")}
          className={sortBy === "date" ? "bg-gray-100" : ""}
        >
          Date {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort("views")}
          className={`ml-2 ${sortBy === "views" ? "bg-gray-100" : ""}`}
        >
          Views {sortBy === "views" && (sortDirection === "asc" ? "↑" : "↓")}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort("likes")}
          className={`ml-2 ${sortBy === "likes" ? "bg-gray-100" : ""}`}
        >
          Likes {sortBy === "likes" && (sortDirection === "asc" ? "↑" : "↓")}
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artwork</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArtworks.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-sm overflow-hidden bg-gray-100 mr-3 shrink-0"
                    >
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[150px]">{artwork.title}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{artwork.category}</TableCell>
                <TableCell className="hidden md:table-cell">{getTimeAgo(artwork.createdAt)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{artwork.views || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Heart className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{artwork.likes || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                      title="View artwork"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/edit/${artwork.id}`)}
                      title="Edit artwork"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/artwork/${artwork.id}`);
                        alert("Link copied to clipboard!");
                      }}
                      title="Copy link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArtworksList;
