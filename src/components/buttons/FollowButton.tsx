
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  artistId: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

const FollowButton = ({ 
  artistId, 
  variant = "outline", 
  size = "sm",
  showText = true,
  className = "" 
}: FollowButtonProps) => {
  const { currentUser } = useAuthStore();
  const { isFollowing, toggleFollow } = useFollows();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setFollowing(isFollowing(artistId));
    }
  }, [currentUser, artistId, isFollowing]);
  
  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    setLoading(true);
    const result = await toggleFollow(artistId);
    setFollowing(result);
    setLoading(false);
  };
  
  return (
    <Button
      variant={following ? "default" : variant}
      size={size}
      onClick={handleFollowClick}
      disabled={loading || artistId === currentUser?.id}
      className={`${className} ${artistId === currentUser?.id ? "hidden" : ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          {showText && "Following"}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          {showText && "Follow"}
        </>
      )}
    </Button>
  );
};

export default FollowButton;
