
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    setFormData({
      username: currentUser.username || "",
      bio: currentUser.bio || "",
      avatar: currentUser.avatar || "",
    });
    
    setAvatarPreview(currentUser.avatar || null);
  }, [currentUser, navigate]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // In a real app with Supabase, we'd upload to storage here
      // For now, we'll use a local URL for demo purposes
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData({ ...formData, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    // Update profile
    updateUserProfile({
      ...formData
    });
    
    toast.success("Profile updated successfully");
    navigate("/profile");
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={avatarPreview || ""} alt={formData.username} />
                <AvatarFallback className="text-3xl">
                  {formData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full">
                <Label htmlFor="avatar" className="block mb-2">Profile Picture</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                
                {!avatarPreview && (
                  <div className="mt-2">
                    <Label htmlFor="avatarUrl">Or enter image URL</Label>
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar}
                      onChange={(e) => {
                        setFormData({ ...formData, avatar: e.target.value });
                        setAvatarPreview(e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={5}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
