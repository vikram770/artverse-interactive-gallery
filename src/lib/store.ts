
import { Artwork, User, Comment } from "@/types";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from "sonner";
import { artworks, users, comments } from "./data";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        // Get users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        const user = storedUsers.find(
          (u: User) => u.email === email && u.password === password
        );
        
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          toast.success("Logged in successfully!");
          return true;
        }
        
        toast.error("Invalid email or password");
        return false;
      },
      register: (userData: Partial<User>) => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user with this email already exists
        if (storedUsers.some((u: User) => u.email === userData.email)) {
          toast.error("User with this email already exists");
          return false;
        }
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          username: userData.username || '',
          email: userData.email || '',
          password: userData.password || '',
          role: userData.role || 'visitor',
          createdAt: new Date().toISOString(),
          likedArtworks: [],
          ...userData
        };
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
        
        // Auto login
        set({ currentUser: newUser, isAuthenticated: true });
        toast.success("Registration successful!");
        return true;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
        toast.success("Logged out successfully");
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
  getArtworks: () => void;
  getArtworkById: (id: string) => Artwork | undefined;
  getArtworksByArtist: (artistId: string) => Artwork[];
  addArtwork: (artwork: Partial<Artwork>) => void;
  updateArtwork: (id: string, artworkData: Partial<Artwork>) => void;
  deleteArtwork: (id: string) => void;
  getCommentsByArtworkId: (artworkId: string) => Comment[];
  addComment: (comment: Partial<Comment>) => void;
  toggleLike: (artworkId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: string, value: string | number | null) => void;
  clearFilters: () => void;
  setSelectedArtwork: (artwork: Artwork | null) => void;
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
      getArtworks: () => {
        const storedArtworks = JSON.parse(localStorage.getItem('artworks') || '[]');
        const storedComments = JSON.parse(localStorage.getItem('comments') || '[]');
        
        set({ 
          artworks: storedArtworks,
          filteredArtworks: storedArtworks,
          comments: storedComments
        });
        
        // Apply any active filters or search
        const { searchQuery, activeFilters } = get();
        if (searchQuery || activeFilters.category || activeFilters.year) {
          get().setSearchQuery(searchQuery);
        }
      },
      getArtworkById: (id: string) => {
        return get().artworks.find(artwork => artwork.id === id);
      },
      getArtworksByArtist: (artistId: string) => {
        return get().artworks.filter(artwork => artwork.artistId === artistId);
      },
      addArtwork: (artworkData: Partial<Artwork>) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to add artwork");
          return;
        }
        
        const newArtwork: Artwork = {
          id: `artwork_${Date.now()}`,
          title: artworkData.title || "Untitled",
          description: artworkData.description || "",
          imageUrl: artworkData.imageUrl || "",
          artistId: currentUser.id,
          category: artworkData.category || "Other",
          medium: artworkData.medium || "",
          dimensions: artworkData.dimensions,
          year: artworkData.year || new Date().getFullYear(),
          likes: 0,
          views: 0,
          tags: artworkData.tags || [],
          createdAt: new Date().toISOString(),
        };
        
        const updatedArtworks = [...get().artworks, newArtwork];
        localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
        
        set({ 
          artworks: updatedArtworks,
          filteredArtworks: updatedArtworks
        });
        
        toast.success("Artwork added successfully");
      },
      updateArtwork: (id: string, artworkData: Partial<Artwork>) => {
        const { currentUser } = useAuthStore.getState();
        const artwork = get().getArtworkById(id);
        
        if (!artwork) {
          toast.error("Artwork not found");
          return;
        }
        
        if (!currentUser || (currentUser.id !== artwork.artistId && currentUser.role !== 'admin')) {
          toast.error("You don't have permission to edit this artwork");
          return;
        }
        
        const updatedArtworks = get().artworks.map(art => 
          art.id === id ? { ...art, ...artworkData } : art
        );
        
        localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
        
        set({ 
          artworks: updatedArtworks,
          filteredArtworks: updatedArtworks,
          selectedArtwork: get().selectedArtwork?.id === id 
            ? { ...get().selectedArtwork, ...artworkData } 
            : get().selectedArtwork
        });
        
        toast.success("Artwork updated successfully");
      },
      deleteArtwork: (id: string) => {
        const { currentUser } = useAuthStore.getState();
        const artwork = get().getArtworkById(id);
        
        if (!artwork) {
          toast.error("Artwork not found");
          return;
        }
        
        if (!currentUser || (currentUser.id !== artwork.artistId && currentUser.role !== 'admin')) {
          toast.error("You don't have permission to delete this artwork");
          return;
        }
        
        const updatedArtworks = get().artworks.filter(art => art.id !== id);
        localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
        
        // Also delete related comments
        const updatedComments = get().comments.filter(comment => comment.artworkId !== id);
        localStorage.setItem('comments', JSON.stringify(updatedComments));
        
        set({ 
          artworks: updatedArtworks,
          filteredArtworks: updatedArtworks,
          comments: updatedComments,
          selectedArtwork: get().selectedArtwork?.id === id ? null : get().selectedArtwork
        });
        
        toast.success("Artwork deleted successfully");
      },
      getCommentsByArtworkId: (artworkId: string) => {
        return get().comments.filter(comment => comment.artworkId === artworkId);
      },
      addComment: (commentData: Partial<Comment>) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to add a comment");
          return;
        }
        
        const newComment: Comment = {
          id: `comment_${Date.now()}`,
          artworkId: commentData.artworkId || "",
          userId: currentUser.id,
          text: commentData.text || "",
          createdAt: new Date().toISOString()
        };
        
        const updatedComments = [...get().comments, newComment];
        localStorage.setItem('comments', JSON.stringify(updatedComments));
        
        set({ comments: updatedComments });
        
        toast.success("Comment added successfully");
      },
      toggleLike: (artworkId: string) => {
        const { currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          toast.error("You must be logged in to like artwork");
          return;
        }
        
        const artwork = get().getArtworkById(artworkId);
        if (!artwork) {
          toast.error("Artwork not found");
          return;
        }
        
        // Get users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = storedUsers.findIndex((u: User) => u.id === currentUser.id);
        
        if (userIndex === -1) {
          toast.error("User not found");
          return;
        }
        
        let updatedLikes = artwork.likes;
        let updatedLikedArtworks = [...storedUsers[userIndex].likedArtworks];
        
        const hasLiked = updatedLikedArtworks.includes(artworkId);
        
        if (hasLiked) {
          // Unlike
          updatedLikes--;
          updatedLikedArtworks = updatedLikedArtworks.filter(id => id !== artworkId);
        } else {
          // Like
          updatedLikes++;
          updatedLikedArtworks.push(artworkId);
        }
        
        // Update the user's liked artworks
        storedUsers[userIndex].likedArtworks = updatedLikedArtworks;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        
        // Update the auth store
        useAuthStore.setState({
          currentUser: {
            ...currentUser,
            likedArtworks: updatedLikedArtworks
          }
        });
        
        // Update the artwork
        const updatedArtworks = get().artworks.map(art => 
          art.id === artworkId ? { ...art, likes: updatedLikes } : art
        );
        
        localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
        
        set({ 
          artworks: updatedArtworks,
          filteredArtworks: get().filteredArtworks.map(art => 
            art.id === artworkId ? { ...art, likes: updatedLikes } : art
          ),
          selectedArtwork: get().selectedArtwork?.id === artworkId 
            ? { ...get().selectedArtwork, likes: updatedLikes } 
            : get().selectedArtwork
        });
        
        toast.success(hasLiked ? "Artwork unliked" : "Artwork liked");
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
      setSelectedArtwork: (artwork: Artwork | null) => {
        set({ selectedArtwork: artwork });
        
        if (artwork) {
          // Increment view count
          const updatedArtworks = get().artworks.map(art => 
            art.id === artwork.id ? { ...art, views: art.views + 1 } : art
          );
          
          localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
          
          set({ 
            artworks: updatedArtworks,
            filteredArtworks: get().filteredArtworks.map(art => 
              art.id === artwork.id ? { ...art, views: art.views + 1 } : art
            ),
            selectedArtwork: { ...artwork, views: artwork.views + 1 }
          });
        }
      }
    }),
    {
      name: 'gallery-storage'
    }
  )
);

// Initialize data in local storage
export const initializeStores = () => {
  // First, check if we need to initialize localStorage
  if (!localStorage.getItem('artworks')) {
    localStorage.setItem('artworks', JSON.stringify(artworks));
  }
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  if (!localStorage.getItem('comments')) {
    localStorage.setItem('comments', JSON.stringify(comments));
  }
  
  // Then initialize the gallery store with data from localStorage
  useGalleryStore.getState().getArtworks();
};
