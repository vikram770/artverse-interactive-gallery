import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          console.log("Current user ID:", currentUser.id); // Log the user ID for debugging
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                username: currentUser.username || currentUser.email?.split('@')[0],
                role: currentUser.role || 'visitor'
              });
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast.error("Error creating your profile");
            } else {
              setFormData({
                username: currentUser.username || currentUser.email?.split('@')[0] || "",
                bio: currentUser.bio || "",
                avatar: currentUser.avatar || "",
              });
              
              setAvatarPreview(currentUser.avatar || null);
            }
          } else {
            toast.error("Error fetching your profile");
          }
        } else if (profile) {
          setFormData({
            username: profile.username || "",
            bio: profile.bio || "",
            avatar: profile.avatar || "",
          });
          
          setAvatarPreview(profile.avatar || null);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [currentUser, navigate]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // In a future implementation, we would upload to Supabase storage
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setLoading(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          username: formData.username,
          bio: formData.bio,
          avatar: formData.avatar,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      // Update the local user state
      await updateUserProfile({
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar
      });
      
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !currentUser) {
    return <div className="py-12 text-center">Loading...</div>;
  }
  
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
                  disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/profile")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
