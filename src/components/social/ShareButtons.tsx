
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share, Facebook, Twitter, Linkedin, Link } from "lucide-react";

interface ShareButtonsProps {
  artworkId: string;
  title: string;
  imageUrl: string;
}

const ShareButtons = ({ artworkId, title, imageUrl }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/artwork/${artworkId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(imageUrl);
  
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link");
    }
  };
  
  const handleShareClick = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-3">
          <h4 className="font-medium text-sm">Share artwork</h4>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={() => handleShareClick(socialLinks.facebook)}
            >
              <Facebook className="h-4 w-4 text-blue-600" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={() => handleShareClick(socialLinks.twitter)}
            >
              <Twitter className="h-4 w-4 text-blue-400" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={() => handleShareClick(socialLinks.linkedin)}
            >
              <Linkedin className="h-4 w-4 text-blue-800" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={handleCopyLink}
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Share this artwork with friends and followers!
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButtons;
