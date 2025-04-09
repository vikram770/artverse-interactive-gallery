
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const [username, setUsername] = useState<string>("Loading...");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Get user info
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find((u: any) => u.id === comment.userId);
    
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar);
    } else {
      setUsername("Unknown User");
    }
  }, [comment.userId]);
  
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
