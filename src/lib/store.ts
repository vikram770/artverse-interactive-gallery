import { Artwork, User, Comment } from "@/types";
import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/integrations/supabase/schema";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Get the user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            const currentUser: User = {
              id: data.user.id,
              email: data.user.email || '',
              username: profile?.username || data.user.email?.split('@')[0] || '',
              password: '', // We don't store passwords
              role: (profile?.role as 'visitor' | 'artist' | 'admin') || 'visitor',
              avatar: profile?.avatar || '',
              bio: profile?.bio || '',
              createdAt: data.user.created_at || new Date().toISOString(),
              likedArtworks: []
            };
            
            set({ currentUser, isAuthenticated: true });
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error('Login error:', error);
          if (error.message === 'Load failed') {
            throw new Error('Connection to authentication service failed. Please check your internet connection.');
          }
          throw error;
        }
      },
      register: async (userData: Partial<User>) => {
        try {
          // First, sign up the user
          const { data, error } = await supabase.auth.signUp({
            email: userData.email || '',
            password: userData.password || '',
            options: {
              data: {
                username: userData.username,
                role: userData.role || 'visitor'
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Create or update the profile record
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                username: userData.username,
                role: userData.role || 'visitor',
                created_at: new Date().toISOString()
              });
            
            if (profileError) {
              console.error('Profile creation error:', profileError);
              // Don't throw here, we still created the auth user
            }
            
            // For immediate login if email confirmation is disabled
            if (data.session) {
              const currentUser: User = {
                id: data.user.id,
                email: data.user.email || '',
                username: userData.username || data.user.email?.split('@')[0] || '',
                password: '', // We don't store passwords
                role: userData.role || 'visitor',
                createdAt: data.user.created_at || new Date().toISOString(),
                likedArtworks: []
              };
              
              set({ currentUser, isAuthenticated: true });
            }
            
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error('Registration error:', error);
          if (error.message === 'Load failed') {
            throw new Error('Connection to authentication service failed. Please check your internet connection.');
          }
          throw error;
        }
      },
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ currentUser: null, isAuthenticated: false });
          toast.success("Logged out successfully");
        } catch (error: any) {
          console.error('Logout error:', error);
          toast.error(error.message || "Error during logout");
        }
      },
      updateUserProfile: async (profileData: Partial<User>) => {
        const { currentUser } = get();
        
        if (!currentUser) {
          toast.error("You must be logged in to update your profile");
          return;
        }
        
        try {
          // Update profile in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({
              username: profileData.username,
              avatar: profileData.avatar,
              bio: profileData.bio,
              role: profileData.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
          
          if (error) throw error;
          
          // Update the current user in state
          set({
            currentUser: {
              ...currentUser,
              ...profileData
            }
          });
          
          toast.success("Profile updated successfully");
        } catch (error: any) {
          console.error('Profile update error:', error);
          toast.error(error.message || "Error updating profile");
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

interface GalleryState {
  artworks: Artwork[];
  filteredArtworks: Artwork[];
  selectedArtwork: Artwork | null;
  comments: Comment[];
  searchQuery: string;
  activeFilters: {
    category: string;
    year: number | null;
  };
  getArtworks: () => Promise<void>;
  getArtworkById: (id: string) => Promise<Artwork | undefined>;
  getArtworksByArtist: (artistId: string) => Promise<Artwork[]>;
  addArtwork: (artwork: Partial<Artwork>) => Promise<void>;
  updateArtwork: (id: string, artworkData: Partial<Artwork>) => Promise<void>;
  deleteArtwork: (id: string) => Promise<void>;
  getCommentsByArtworkId: (artworkId: string) => Promise<Comment[]>;
  addComment: (comment: Partial<Comment>) => Promise<void>;
  toggleLike: (artworkId: string) => Promise<void>;
  getUserLikedArtworks: (userId: string) => Promise<string[]>;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: string, value: string | number | null) => void;
  clearFilters: () => void;
  setSelectedArtwork: (artwork: Artwork | null) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      artworks: [],
      filteredArtworks: [],
      selectedArtwork: null,
      comments: [],
      searchQuery: '',
      activeFilters: {
        category: '',
        year: null
      },
      getArtworks: async () => {
        try {
          const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const artworks: Artwork[] = (data || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            imageUrl: item.image_url,
            artistId: item.artist_id,
            category: item.category || 'Other',
            medium: item.medium || '',
            dimensions: item.dimensions || '',
            year: item.year || new Date().getFullYear(),
            likes: item.likes || 0,
            views: item.views || 0,
            tags: item.tags || [],
            createdAt: item.created_at,
            isForSale: item.is_for_sale || false,
            price: item.price?.toString() || '',
          }));
          
          set({ 
            artworks: artworks,
            filteredArtworks: artworks
          });
          
          // Apply any active filters or search
          const { searchQuery, activeFilters } = get();
          if (searchQuery || activeFilters.category || activeFilters.year) {
            get().setSearchQuery(searchQuery);
          }
        } catch (error: any) {
          console.error('Error fetching artworks:', error);
          toast.error('Failed to load artworks');
        }
      },
      getArtworkById: async (id: string) => {
        try {
          const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            const artwork: Artwork = {
              id: data.id,
              title: data.title,
              description: data.description || '',
              imageUrl: data.image_url,
              artistId: data.artist_id,
              category: data.category || 'Other',
              medium: data.medium || '',
              dimensions: data.dimensions || '',
              year: data.year || new Date().getFullYear(),
              likes: data.likes || 0,
              views: data.views || 0,
              tags: data.tags || [],
              createdAt: data.created_at,
              isForSale: data.is_for_sale || false,
              price: data.price?.toString() || '',
            };
            return artwork;
          }
        } catch (error) {
          console.error('Error fetching artwork:', error);
          toast.error('Failed to load artwork details');
        }
        return undefined;
      },
      getArtworksByArtist: async (artistId: string) => {
        try {
          const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('artist_id', artistId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          return (data || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            imageUrl: item.image_url,
            artistId: item.artist_id,
            category: item.category || 'Other',
            medium: item.medium || '',
            dimensions: item.dimensions || '',
            year: item.year || new Date().getFullYear(),
            likes: item.likes || 0,
            views: item.views || 0,
            tags: item.tags || [],
            createdAt: item.created_at,
            isForSale: item.is_for_sale || false,
            price: item.price?.toString() || '',
          }));
        } catch (error) {
          console.error('Error fetching artist artworks:', error);
          toast.error('Failed to load artist artworks');
          return [];
        }
      },
      addArtwork: async (artworkData: Partial<Artwork>) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to add artwork");
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('artworks')
            .insert({
              title: artworkData.title || 'Untitled',
              description: artworkData.description || '',
              image_url: artworkData.imageUrl || '',
              artist_id: currentUser.id,
              category: artworkData.category || 'Other',
              medium: artworkData.medium || '',
              dimensions: artworkData.dimensions || '',
              year: artworkData.year || new Date().getFullYear(),
              tags: artworkData.tags || [],
              is_for_sale: artworkData.isForSale || false,
              price: artworkData.price ? parseFloat(artworkData.price) : null,
            })
            .select()
            .single();
          
          if (error) throw error;
          
          if (data) {
            const newArtwork: Artwork = {
              id: data.id,
              title: data.title,
              description: data.description || '',
              imageUrl: data.image_url,
              artistId: data.artist_id,
              category: data.category || 'Other',
              medium: data.medium || '',
              dimensions: data.dimensions || '',
              year: data.year || new Date().getFullYear(),
              likes: data.likes || 0,
              views: data.views || 0,
              tags: data.tags || [],
              createdAt: data.created_at,
              isForSale: data.is_for_sale || false,
              price: data.price?.toString() || '',
            };
            
            const updatedArtworks = [newArtwork, ...get().artworks];
            
            set({
              artworks: updatedArtworks,
              filteredArtworks: get().searchQuery ? get().filteredArtworks : updatedArtworks
            });
            
            toast.success("Artwork added successfully");
          }
        } catch (error: any) {
          console.error('Error adding artwork:', error);
          toast.error(error.message || 'Failed to add artwork');
        }
      },
      updateArtwork: async (id: string, artworkData: Partial<Artwork>) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to update artwork");
          return;
        }
        
        try {
          // Get existing artwork to check permissions
          const { data: existingArtwork, error: fetchError } = await supabase
            .from('artworks')
            .select('artist_id')
            .eq('id', id)
            .single();
          
          if (fetchError) throw fetchError;
          
          if (existingArtwork && existingArtwork.artist_id !== currentUser.id && currentUser.role !== 'admin') {
            toast.error("You don't have permission to edit this artwork");
            return;
          }
          
          const { error } = await supabase
            .from('artworks')
            .update({
              title: artworkData.title,
              description: artworkData.description,
              image_url: artworkData.imageUrl,
              category: artworkData.category,
              medium: artworkData.medium,
              dimensions: artworkData.dimensions,
              year: artworkData.year,
              tags: artworkData.tags,
              is_for_sale: artworkData.isForSale,
              price: artworkData.price ? parseFloat(artworkData.price) : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
          
          if (error) throw error;
          
          // Refresh the artwork data
          const updatedArtwork = await get().getArtworkById(id);
          
          if (updatedArtwork) {
            set({
              artworks: get().artworks.map(art => 
                art.id === id ? updatedArtwork : art
              ),
              filteredArtworks: get().filteredArtworks.map(art => 
                art.id === id ? updatedArtwork : art
              ),
              selectedArtwork: get().selectedArtwork?.id === id 
                ? updatedArtwork 
                : get().selectedArtwork
            });
          }
          
          toast.success("Artwork updated successfully");
        } catch (error: any) {
          console.error('Error updating artwork:', error);
          toast.error(error.message || 'Failed to update artwork');
        }
      },
      deleteArtwork: async (id: string) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to delete artwork");
          return;
        }
        
        try {
          // Get existing artwork to check permissions
          const { data: existingArtwork, error: fetchError } = await supabase
            .from('artworks')
            .select('artist_id')
            .eq('id', id)
            .single();
          
          if (fetchError) throw fetchError;
          
          if (existingArtwork && existingArtwork.artist_id !== currentUser.id && currentUser.role !== 'admin') {
            toast.error("You don't have permission to delete this artwork");
            return;
          }
          
          const { error } = await supabase
            .from('artworks')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set({ 
            artworks: get().artworks.filter(art => art.id !== id),
            filteredArtworks: get().filteredArtworks.filter(art => art.id !== id),
            selectedArtwork: get().selectedArtwork?.id === id ? null : get().selectedArtwork
          });
          
          toast.success("Artwork deleted successfully");
        } catch (error: any) {
          console.error('Error deleting artwork:', error);
          toast.error(error.message || 'Failed to delete artwork');
        }
      },
      getCommentsByArtworkId: async (artworkId: string) => {
        try {
          // Use a different approach for fetching comments and user data
          const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('artwork_id', artworkId)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          
          // Now that we have comments, fetch the profiles separately
          const comments = await Promise.all((data || []).map(async (item) => {
            // Get user profile for each comment
            const { data: userData } = await supabase
              .from('profiles')
              .select('username, avatar')
              .eq('id', item.user_id)
              .single();
            
            return {
              id: item.id,
              artworkId: item.artwork_id,
              userId: item.user_id,
              text: item.text,
              createdAt: item.created_at,
              user: userData ? {
                username: userData.username || 'Unknown User',
                avatar: userData.avatar || null
              } : {
                username: 'Unknown User',
                avatar: null
              }
            };
          }));
          
          return comments;
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast.error('Failed to load comments');
          return [];
        }
      },
      toggleLike: async (artworkId: string) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to like artwork");
          return;
        }
        
        try {
          // Check if the user has already liked this artwork
          const { data: existingLike, error: checkError } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('artwork_id', artworkId)
            .maybeSingle();
          
          if (checkError) throw checkError;
          
          // Get the artwork details for the notification
          const artwork = await get().getArtworkById(artworkId);
          if (!artwork) throw new Error('Artwork not found');
          
          if (existingLike) {
            // Remove the like
            const { error: unlikeError } = await supabase
              .from('likes')
              .delete()
              .eq('id', existingLike.id);
            
            if (unlikeError) throw unlikeError;
            
            toast.success("Artwork unliked");
          } else {
            // Add the like
            const { error: likeError } = await supabase
              .from('likes')
              .insert({
                user_id: currentUser.id,
                artwork_id: artworkId
              });
            
            if (likeError) throw likeError;
            
            // Create a notification if the current user is not the artwork owner
            if (artwork.artistId !== currentUser.id) {
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  user_id: artwork.artistId,
                  type: 'like',
                  content: `${currentUser.username} liked your artwork "${artwork.title}"`,
                  artwork_id: artworkId,
                  sender_id: currentUser.id
                });
              
              if (notificationError) console.error('Error creating notification:', notificationError);
            }
            
            toast.success("Artwork liked");
          }
          
          // Update the artwork in our local state with the new like count
          const updatedArtwork = await get().getArtworkById(artworkId);
          
          if (updatedArtwork) {
            set({
              artworks: get().artworks.map(art => 
                art.id === artworkId ? updatedArtwork : art
              ),
              filteredArtworks: get().filteredArtworks.map(art => 
                art.id === artworkId ? updatedArtwork : art
              ),
              selectedArtwork: get().selectedArtwork?.id === artworkId 
                ? updatedArtwork 
                : get().selectedArtwork
            });
          }
          
          // Update user's likedArtworks list
          const likedArtworks = await get().getUserLikedArtworks(currentUser.id);
          useAuthStore.setState({
            currentUser: {
              ...currentUser,
              likedArtworks
            }
          });
        } catch (error: any) {
          console.error('Error toggling like:', error);
          toast.error(error.message || 'Failed to like/unlike artwork');
        }
      },
      addComment: async (comment: Partial<Comment>) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to add a comment");
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('comments')
            .insert({
              artwork_id: comment.artworkId,
              user_id: currentUser.id,
              text: comment.text
            })
            .select('*')
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Get the user profile
            const { data: userData } = await supabase
              .from('profiles')
              .select('username, avatar')
              .eq('id', currentUser.id)
              .single();
            
            const newComment: Comment = {
              id: data.id,
              artworkId: data.artwork_id,
              userId: data.user_id,
              text: data.text,
              createdAt: data.created_at,
              user: userData ? {
                username: userData.username || currentUser.username,
                avatar: userData.avatar || currentUser.avatar
              } : {
                username: currentUser.username,
                avatar: currentUser.avatar
              }
            };
            
            set({ comments: [...get().comments, newComment] });
            
            // Get the artwork details for the notification
            const artwork = await get().getArtworkById(comment.artworkId!);
            
            // Create a notification if the current user is not the artwork owner
            if (artwork && artwork.artistId !== currentUser.id) {
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  user_id: artwork.artistId,
                  type: 'comment',
                  content: `${currentUser.username} commented on your artwork "${artwork.title}"`,
                  artwork_id: comment.artworkId,
                  sender_id: currentUser.id
                });
              
              if (notificationError) console.error('Error creating notification:', notificationError);
            }
            
            toast.success("Comment added successfully");
          }
        } catch (error: any) {
          console.error('Error adding comment:', error);
          toast.error(error.message || 'Failed to add comment');
        }
      },
      getUserLikedArtworks: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('likes')
            .select('artwork_id')
            .eq('user_id', userId);
          
          if (error) throw error;
          
          return (data || []).map(item => item.artwork_id);
        } catch (error) {
          console.error('Error fetching likes:', error);
          return [];
        }
      },
      setSearchQuery: (query: string) => {
        const filteredResults = get().artworks.filter(artwork => {
          const matchesQuery = query === '' || 
            artwork.title.toLowerCase().includes(query.toLowerCase()) ||
            artwork.description.toLowerCase().includes(query.toLowerCase()) ||
            artwork.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
          
          const { category, year } = get().activeFilters;
          
          const matchesCategory = !category || artwork.category === category;
          const matchesYear = !year || artwork.year === year;
          
          return matchesQuery && matchesCategory && matchesYear;
        });
        
        set({ 
          searchQuery: query,
          filteredArtworks: filteredResults
        });
      },
      setFilter: (filter: string, value: string | number | null) => {
        const newFilters = {
          ...get().activeFilters,
          [filter]: value
        };
        
        set({ activeFilters: newFilters });
        
        // Re-apply search with new filters
        get().setSearchQuery(get().searchQuery);
      },
      clearFilters: () => {
        set({ 
          activeFilters: {
            category: '',
            year: null
          }
        });
        
        // Reset to just search query filtering
        get().setSearchQuery(get().searchQuery);
      },
      setSelectedArtwork: async (artwork: Artwork | null) => {
        set({ selectedArtwork: artwork });
        
        if (artwork) {
          try {
            // Increment view count
            const { error } = await supabase
              .from('artworks')
              .update({ views: artwork.views + 1 })
              .eq('id', artwork.id);
            
            if (error) throw error;
            
            // Get the updated artwork
            const updatedArtwork = await get().getArtworkById(artwork.id);
            
            if (updatedArtwork) {
              set({
                artworks: get().artworks.map(art => 
                  art.id === artwork.id ? updatedArtwork : art
                ),
                filteredArtworks: get().filteredArtworks.map(art => 
                  art.id === artwork.id ? updatedArtwork : art
                ),
                selectedArtwork: updatedArtwork
              });
            }
          } catch (error) {
            console.error('Error updating view count:', error);
          }
        }
      }
    }),
    {
      name: 'gallery-storage'
    }
  )
);

// Initialize data in Supabase 
export const initializeAuth = async () => {
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Get the user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    // Get user's liked artworks
    const { data: likes } = await supabase
      .from('likes')
      .select('artwork_id')
      .eq('user_id', session.user.id);
    
    const likedArtworks = (likes || []).map(like => like.artwork_id);
    
    const currentUser: User = {
      id: session.user.id,
      email: session.user.email || '',
      username: profile?.username || session.user.email?.split('@')[0] || '',
      password: '', // We don't store passwords
      role: (profile?.role as 'visitor' | 'artist' | 'admin') || 'visitor',
      avatar: profile?.avatar || '',
      bio: profile?.bio || '',
      createdAt: session.user.created_at || new Date().toISOString(),
      likedArtworks: likedArtworks
    };
    
    useAuthStore.setState({
      currentUser,
      isAuthenticated: true
    });
  }
  
  // Initialize gallery data
  useGalleryStore.getState().getArtworks();
};
