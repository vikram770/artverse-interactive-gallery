
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const QuickUploadButton = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleUploadClick = () => {
    if (!currentUser) {
      setOpen(true);
      return;
    }

    if (currentUser.role !== "artist" && currentUser.role !== "admin") {
      setOpen(true);
      return;
    }

    // If user is authenticated and is an artist, navigate to upload page
    navigate("/upload");
  };

  return (
    <>
      <Button 
        onClick={handleUploadClick}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        size="lg"
      >
        <Upload className="mr-2 h-5 w-5" />
        Upload Artwork
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              {!currentUser 
                ? "You need to be logged in to upload artwork."
                : "Only artists can upload artwork. Please update your profile to artist role."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setOpen(false);
                navigate(!currentUser ? "/login" : "/profile/edit");
              }}
            >
              {!currentUser ? "Login" : "Update Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickUploadButton;
