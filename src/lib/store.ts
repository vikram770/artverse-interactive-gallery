import { create } from 'zustand';
import { User, Artwork } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

export const useAuthStore = create<AuthState>((set) => ({
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
            role: userData.role,
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

        const user: User = {
          id: data.user.id,
          username: profileData?.username || data.user.email?.split('@')[0] || 'Unknown',
          email: data.user.email || email,
          password: password,
          role: profileData?.role || 'visitor',
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

    const user: User = {
      id: session.user.id,
      username: profileData?.username || session.user.email?.split('@')[0] || 'Unknown',
      email: session.user.email || '',
      password: '',
      role: profileData?.role || 'visitor',
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
  getArtworksByArtist: (artistId: string) => Promise<Artwork[]>;
  getUserLikedArtworks: (userId: string) => Promise<string[]>;
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
