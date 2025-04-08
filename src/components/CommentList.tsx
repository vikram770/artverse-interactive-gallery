
import { useEffect, useState } from "react";
import { Comment, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  
  useEffect(() => {
    // Load users from localStorage
    const loadUsers = () => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const map: Record<string, User> = {};
      
      storedUsers.forEach((user: User) => {
        map[user.id] = user;
      });
      
      setUserMap(map);
    };
    
    loadUsers();
  }, []);
  
  if (comments.length === 0) {
    return <p className="text-gray-500">No comments yet.</p>;
  }
  
  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="space-y-6">
      {sortedComments.map((comment) => {
        const user = userMap[comment.userId] || { username: 'Unknown User', avatar: undefined };
        
        return (
          <div key={comment.id} className="flex space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-baseline">
                <h4 className="font-semibold text-sm mr-2">{user.username}</h4>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{comment.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
