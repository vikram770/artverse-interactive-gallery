
import { useState } from "react";
import { Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import CommentItem from "./CommentItem";
import { User } from "@/types";

interface CommentSectionProps {
  artworkId: string;
  currentUser: User | null;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const CommentSection = ({ 
  artworkId, 
  currentUser, 
  comments, 
  onAddComment 
}: CommentSectionProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment("");
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-0 h-auto text-gray-500 text-sm"
        onClick={toggleComments}
      >
        View all {comments.length || "..."} comments
      </Button>
      
      {showComments && (
        <>
          <Separator />
          <div className="px-4 py-2 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {currentUser && (
        <div className="p-3 border-t">
          <form onSubmit={handleSubmitComment} className="w-full flex items-center gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-0 h-9 py-2 resize-none"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              disabled={!newComment.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default CommentSection;
