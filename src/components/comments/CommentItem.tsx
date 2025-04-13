
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const [username, setUsername] = useState<string>(comment.user?.username || "Loading...");
  const [avatar, setAvatar] = useState<string | undefined>(comment.user?.avatar || undefined);
  
  useEffect(() => {
    // Check if we already have user info from the query
    if (comment.user?.username) {
      setUsername(comment.user.username);
      setAvatar(comment.user.avatar || undefined);
      return;
    }
    
    // If not, fetch the user info directly
    const fetchUserData = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar')
          .eq('id', comment.userId)
          .single();
        
        if (data) {
          setUsername(data.username || 'Unknown User');
          setAvatar(data.avatar || undefined);
        } else {
          setUsername("Unknown User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("Unknown User");
      }
    };
    
    fetchUserData();
  }, [comment.userId, comment.user]);
  
  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  return (
    <div className="flex gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-1">
          <Link to={`/artist/${comment.userId}`} className="text-sm font-medium">
            {username}
          </Link>
          <p className="text-sm break-words">{comment.text}</p>
        </div>
        <p className="text-xs text-gray-500">{getTimeAgo()}</p>
      </div>
    </div>
  );
};

export default CommentItem;
