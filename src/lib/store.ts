import { create } from 'zustand';
import { User, Artwork } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = 'visitor' | 'artist' | 'admin';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAuth: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'likedArtworks'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: { username?: string; bio?: string; avatar?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: (user) => set({ currentUser: user }),
  setAuth: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            role: userData.role,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        set({
          currentUser: {
            id: data.user.id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role as UserRole,
            createdAt: new Date().toISOString(),
            likedArtworks: [],
          },
          isAuthenticated: true,
        });
        toast.success(`Account created successfully for ${userData.email}`);
      }
    } catch (err: any) {
      set({ error: err.message });
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.user) {
        // Fetch user profile from 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        const userRole = (profileData?.role || 'visitor') as UserRole;

        const user: User = {
          id: data.user.id,
          username: profileData?.username || data.user.email?.split('@')[0] || 'Unknown',
          email: data.user.email || email,
          password: password,
          role: userRole,
          createdAt: new Date().toISOString(),
          likedArtworks: [],
          avatar: profileData?.avatar || null,
          bio: profileData?.bio || null,
        };
        set({ currentUser: user, isAuthenticated: true });
        toast.success(`Logged in as ${email}`);
      }
    } catch (err: any) {
      set({ error: err.message });
      toast.error(`Login failed: ${err.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      set({ currentUser: null, isAuthenticated: false });
      toast.success("Logged out successfully");
    } catch (err: any) {
      set({ error: err.message });
      toast.error(`Logout failed: ${err.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
  updateUserProfile: async (profileData) => {
    const { currentUser } = get();
    if (!currentUser) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          username: profileData.username || currentUser.username,
          bio: profileData.bio !== undefined ? profileData.bio : currentUser.bio,
          avatar: profileData.avatar !== undefined ? profileData.avatar : currentUser.avatar,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Update local user state
      set({
        currentUser: {
          ...currentUser,
          username: profileData.username || currentUser.username,
          bio: profileData.bio !== undefined ? profileData.bio : currentUser.bio,
          avatar: profileData.avatar !== undefined ? profileData.avatar : currentUser.avatar,
        }
      });

      toast.success("Profile updated successfully");
    } catch (error: any) {
      set({ error: error.message });
      toast.error(`Profile update error: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  }
}));

export const initializeAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    const userRole = (profileData?.role || 'visitor') as UserRole;

    const user: User = {
      id: session.user.id,
      username: profileData?.username || session.user.email?.split('@')[0] || 'Unknown',
      email: session.user.email || '',
      password: '',
      role: userRole,
      createdAt: new Date().toISOString(),
      likedArtworks: [],
      avatar: profileData?.avatar || null,
      bio: profileData?.bio || null,
    };
    useAuthStore.setState({ currentUser: user, isAuthenticated: true });
  }
};

interface GalleryFilters {
  searchQuery?: string;
  category?: string;
  year?: number;
  medium?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
}

interface GalleryState {
  artworks: Artwork[];
  filteredArtworks: Artwork[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: GalleryFilters;
  getArtworks: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (newFilters: Partial<GalleryFilters>) => void;
  clearFilters: () => void;
  likeArtwork: (artworkId: string) => Promise<void>;
  toggleLike: (artworkId: string) => Promise<void>;
  getArtworkById: (artworkId: string) => Promise<Artwork | null>;
  getArtworksByArtist: (artistId: string) => Promise<Artwork[]>;
  getUserLikedArtworks: (userId: string) => Promise<string[]>;
  addArtwork: (artworkData: any) => Promise<void>;
  updateArtwork: (artworkId: string, artworkData: any) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  artworks: [],
  filteredArtworks: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
  
  getArtworks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const artworks = data.map(item => ({
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
          artworks, 
          filteredArtworks: artworks,
          isLoading: false
        });
      }
    } catch (error: any) {
      console.error("Error fetching artworks:", error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    
    const { artworks, filters } = get();
    const filtered = applyFilters(artworks, { ...filters, searchQuery: query });
    
    set({ filteredArtworks: filtered });
  },
  
  setFilters: (newFilters: Partial<GalleryFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    
    const { artworks } = get();
    const filtered = applyFilters(artworks, updatedFilters);
    
    set({ filteredArtworks: filtered });
  },
  
  clearFilters: () => {
    set({ 
      filters: {}, 
      searchQuery: '',
      filteredArtworks: get().artworks
    });
  },
  
  likeArtwork: async (artworkId: string) => {
    try {
      const userId = useAuthStore.getState().currentUser?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
  
      // Optimistically update the local state
      set((state) => ({
        artworks: state.artworks.map((artwork) =>
          artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) + 1 } : artwork
        ),
        filteredArtworks: state.filteredArtworks.map((artwork) =>
          artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) + 1 } : artwork
        ),
      }));
  
      // Insert the like into the database
      const { error } = await supabase
        .from('likes')
        .insert([{ user_id: userId, artwork_id: artworkId }]);
  
      if (error) {
        // If there's an error, revert the optimistic update
        set((state) => ({
          artworks: state.artworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) - 1 } : artwork
          ),
          filteredArtworks: state.filteredArtworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) - 1 } : artwork
          ),
        }));
        throw error;
      }
  
      toast.success("Artwork liked!");
    } catch (error: any) {
      console.error("Error liking artwork:", error);
      toast.error(`Failed to like artwork: ${error.message}`);
    }
  },
  
  toggleLike: async (artworkId: string) => {
    try {
      const userId = useAuthStore.getState().currentUser?.id;
      if (!userId) {
        toast.error("You must be logged in to like artworks");
        return;
      }
      
      // Check if user has already liked this artwork
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('artwork_id', artworkId)
        .single();
      
      if (data) {
        // User already liked this artwork, so unlike it
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', data.id);
          
        if (error) throw error;
        
        // Update artwork count
        set((state) => ({
          artworks: state.artworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: Math.max(0, (artwork.likes || 0) - 1) } : artwork
          ),
          filteredArtworks: state.filteredArtworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: Math.max(0, (artwork.likes || 0) - 1) } : artwork
          ),
        }));
        
        toast.success("Artwork unliked");
      } else {
        // User hasn't liked this artwork yet, so like it
        const { error } = await supabase
          .from('likes')
          .insert([{ user_id: userId, artwork_id: artworkId }]);
          
        if (error) throw error;
        
        // Update artwork count
        set((state) => ({
          artworks: state.artworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) + 1 } : artwork
          ),
          filteredArtworks: state.filteredArtworks.map((artwork) =>
            artwork.id === artworkId ? { ...artwork, likes: (artwork.likes || 0) + 1 } : artwork
          ),
        }));
        
        toast.success("Artwork liked!");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error(`Failed to update like: ${error.message}`);
    }
  },
  
  getArtworkById: async (artworkId: string) => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', artworkId)
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
      
      return null;
    } catch (error) {
      console.error("Error fetching artwork by ID:", error);
      return null;
    }
  },
  
  getArtworksByArtist: async (artistId: string) => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', artistId);
  
      if (error) {
        throw new Error(error.message);
      }
  
      if (data) {
        const artworks = data.map(item => ({
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
        return artworks;
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching artworks by artist:", error);
      toast.error(`Failed to fetch artworks by artist: ${error.message}`);
      return [];
    }
  },
  
  getUserLikedArtworks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('artwork_id')
        .eq('user_id', userId);
  
      if (error) {
        throw new Error(error.message);
      }
  
      if (data) {
        return data.map(like => like.artwork_id);
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching liked artworks:", error);
      toast.error(`Failed to fetch liked artworks: ${error.message}`);
      return [];
    }
  },
  
  addArtwork: async (artworkData: any) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) {
      toast.error("You must be logged in to add artwork");
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Prepare the data for Supabase
      const artworkRecord = {
        title: artworkData.title,
        description: artworkData.description,
        image_url: artworkData.imageUrl,
        artist_id: currentUser.id,
        category: artworkData.category || 'Other',
        medium: artworkData.medium || '',
        dimensions: artworkData.dimensions || '',
        year: artworkData.year || new Date().getFullYear(),
        tags: artworkData.tags || [],
        is_for_sale: artworkData.isForSale || false,
        price: artworkData.isForSale ? parseFloat(artworkData.price) : null,
      };
      
      const { data, error } = await supabase
        .from('artworks')
        .insert(artworkRecord)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Format the new artwork data
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
          likes: 0,
          views: 0,
          tags: data.tags || [],
          createdAt: data.created_at,
          isForSale: data.is_for_sale || false,
          price: data.price?.toString() || '',
        };
        
        // Update the store with the new artwork
        set(state => ({
          artworks: [newArtwork, ...state.artworks],
          filteredArtworks: [newArtwork, ...state.filteredArtworks],
        }));
        
        toast.success("Artwork added successfully");
      }
    } catch (error: any) {
      console.error("Error adding artwork:", error);
      set({ error: error.message });
      toast.error(`Failed to add artwork: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateArtwork: async (artworkId: string, artworkData: any) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) {
      toast.error("You must be logged in to update artwork");
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Get the existing artwork first
      const { data: existingArtwork, error: fetchError } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', artworkId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verify ownership
      if (existingArtwork.artist_id !== currentUser.id && currentUser.role !== 'admin') {
        throw new Error("You don't have permission to edit this artwork");
      }
      
      // Prepare the data for Supabase
      const artworkRecord = {
        title: artworkData.title,
        description: artworkData.description,
        image_url: artworkData.imageUrl,
        category: artworkData.category || 'Other',
        medium: artworkData.medium || '',
        dimensions: artworkData.dimensions || '',
        year: artworkData.year || new Date().getFullYear(),
        tags: artworkData.tags || [],
        is_for_sale: artworkData.isForSale || false,
        price: artworkData.isForSale ? parseFloat(artworkData.price) : null,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('artworks')
        .update(artworkRecord)
        .eq('id', artworkId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Format the updated artwork data
        const updatedArtwork: Artwork = {
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
        
        // Update the store with the updated artwork
        set(state => ({
          artworks: state.artworks.map(artwork => 
            artwork.id === artworkId ? updatedArtwork : artwork
          ),
          filteredArtworks: state.filteredArtworks.map(artwork => 
            artwork.id === artworkId ? updatedArtwork : artwork
          ),
        }));
        
        toast.success("Artwork updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating artwork:", error);
      set({ error: error.message });
      toast.error(`Failed to update artwork: ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Helper function to apply all filters to artworks
function applyFilters(artworks: Artwork[], filters: GalleryFilters): Artwork[] {
  let filtered = [...artworks];
  
  // Search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      art => 
        art.title.toLowerCase().includes(query) ||
        art.description.toLowerCase().includes(query) ||
        art.category.toLowerCase().includes(query) ||
        art.medium?.toLowerCase().includes(query) ||
        art.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Category filter
  if (filters.category) {
    filtered = filtered.filter(art => art.category === filters.category);
  }
  
  // Year filter
  if (filters.year) {
    filtered = filtered.filter(art => art.year === filters.year);
  }
  
  // Medium filter
  if (filters.medium) {
    filtered = filtered.filter(art => art.medium === filters.medium);
  }
  
  // Tags filter (any tag matches)
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(art => 
      art.tags?.some(tag => filters.tags?.includes(tag))
    );
  }
  
  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(art => parseFloat(art.price || '0') >= (filters.minPrice || 0));
  }
  
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(art => parseFloat(art.price || '0') <= (filters.maxPrice || Infinity));
  }
  
  return filtered;
}
