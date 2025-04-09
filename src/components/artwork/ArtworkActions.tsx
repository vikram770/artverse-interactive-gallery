
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface ArtworkActionsProps {
  isLiked: boolean;
  onLikeClick: (e: React.MouseEvent) => void;
  onCommentClick: () => void;
  likesCount: number;
}

const ArtworkActions = ({ 
  isLiked, 
  onLikeClick, 
  onCommentClick, 
  likesCount 
}: ArtworkActionsProps) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={onLikeClick}
        >
          <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={onCommentClick}
        >
          <MessageCircle className="h-6 w-6 text-gray-700" />
        </Button>
        
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <Share2 className="h-6 w-6 text-gray-700" />
        </Button>
      </div>
      
      <div className="mb-2">
        <p className="font-medium text-sm">{likesCount} likes</p>
      </div>
    </div>
  );
};

export default ArtworkActions;
