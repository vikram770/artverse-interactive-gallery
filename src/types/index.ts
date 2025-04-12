
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'visitor' | 'artist' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  likedArtworks: string[];
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artistId: string;
  category: string;
  medium: string;
  dimensions?: string;
  year: number;
  likes: number;
  views: number;
  tags: string[];
  createdAt: string;
  isForSale?: boolean;
  price?: string;
}

export interface Comment {
  id: string;
  artworkId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: {
    username: string;
    avatar: string | null;
  }
}

export interface Artist extends User {
  artworks: string[];
  exhibitions?: string[];
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}
