
import { Artwork, User, Comment } from "@/types";

// Sample artworks data
export const artworks: Artwork[] = [
  {
    id: "1",
    title: "Harmony in Blue",
    description: "An exploration of various shades of blue creating a serene landscape.",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    artistId: "1",
    category: "Painting",
    medium: "Oil on Canvas",
    dimensions: "24 x 36 inches",
    year: 2022,
    likes: 156,
    views: 1203,
    tags: ["abstract", "blue", "landscape", "modern"],
    createdAt: "2022-06-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Urban Reflections",
    description: "A cityscape reflecting on water, playing with light and shadow.",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=745&q=80",
    artistId: "2",
    category: "Photography",
    medium: "Digital Photography",
    dimensions: "16 x 20 inches",
    year: 2021,
    likes: 89,
    views: 723,
    tags: ["urban", "reflection", "city", "water"],
    createdAt: "2021-11-22T14:15:00Z"
  },
  {
    id: "3",
    title: "Whispering Forest",
    description: "A mystical interpretation of a forest at dawn, with light filtering through the trees.",
    imageUrl: "https://images.unsplash.com/photo-1552083375-1447ce886485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    artistId: "1",
    category: "Painting",
    medium: "Acrylic on Canvas",
    dimensions: "30 x 40 inches",
    year: 2020,
    likes: 213,
    views: 1876,
    tags: ["forest", "nature", "mystical", "dawn"],
    createdAt: "2020-08-03T09:45:00Z"
  },
  {
    id: "4",
    title: "Geometric Abstraction #7",
    description: "A study of geometric forms and their interactions in space.",
    imageUrl: "https://images.unsplash.com/photo-1574182245530-967d9b3831af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    artistId: "3",
    category: "Digital Art",
    medium: "Digital Rendering",
    year: 2023,
    likes: 67,
    views: 542,
    tags: ["geometric", "abstract", "digital", "contemporary"],
    createdAt: "2023-01-17T11:20:00Z"
  },
  {
    id: "5",
    title: "Serenity",
    description: "A peaceful composition capturing the essence of tranquility.",
    imageUrl: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    artistId: "2",
    category: "Sculpture",
    medium: "Marble",
    dimensions: "18 x 12 x 10 inches",
    year: 2019,
    likes: 124,
    views: 982,
    tags: ["sculpture", "marble", "peace", "minimalist"],
    createdAt: "2019-05-29T16:40:00Z"
  },
  {
    id: "6",
    title: "Chaos and Order",
    description: "An exploration of the balance between chaos and order in the universe.",
    imageUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    artistId: "3",
    category: "Mixed Media",
    medium: "Mixed Media on Canvas",
    dimensions: "36 x 48 inches",
    year: 2021,
    likes: 178,
    views: 1456,
    tags: ["abstract", "chaos", "order", "universe", "mixed media"],
    createdAt: "2021-03-12T13:25:00Z"
  },
  {
    id: "7",
    title: "Golden Horizon",
    description: "A sunset landscape with golden hues stretching across the horizon.",
    imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    artistId: "1",
    category: "Painting",
    medium: "Oil on Canvas",
    dimensions: "24 x 36 inches",
    year: 2023,
    likes: 95,
    views: 823,
    tags: ["landscape", "sunset", "golden", "horizon"],
    createdAt: "2023-02-08T15:50:00Z"
  },
  {
    id: "8",
    title: "Fragmented Identity",
    description: "A portrait exploring the multifaceted nature of identity.",
    imageUrl: "https://images.unsplash.com/photo-1501472312651-726afe119ff1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    artistId: "2",
    category: "Photography",
    medium: "Digital Photography",
    dimensions: "20 x 30 inches",
    year: 2022,
    likes: 142,
    views: 1187,
    tags: ["portrait", "identity", "fragmented", "conceptual"],
    createdAt: "2022-09-27T12:10:00Z"
  }
];

// Sample users data
export const users: User[] = [
  {
    id: "1",
    username: "sophia_art",
    email: "sophia@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    bio: "Contemporary artist exploring themes of nature and human connection through various mediums.",
    createdAt: "2020-01-15T08:30:00Z",
    likedArtworks: ["2", "5"]
  },
  {
    id: "2",
    username: "marcus_visual",
    email: "marcus@example.com",
    password: "securepass", // In a real app, this would be hashed
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    bio: "Photographer and digital artist with a passion for urban landscapes and architectural photography.",
    createdAt: "2020-03-22T10:45:00Z",
    likedArtworks: ["1", "3", "6"]
  },
  {
    id: "3",
    username: "elena_creates",
    email: "elena@example.com",
    password: "artlover456", // In a real app, this would be hashed
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    bio: "Digital artist specializing in abstract geometric compositions and 3D renderings.",
    createdAt: "2021-05-10T14:20:00Z",
    likedArtworks: ["4", "7"]
  },
  {
    id: "4",
    username: "art_enthusiast",
    email: "visitor@example.com",
    password: "visit123", // In a real app, this would be hashed
    role: "visitor",
    createdAt: "2021-08-05T09:15:00Z",
    likedArtworks: ["1", "3", "5", "8"]
  },
  {
    id: "5",
    username: "admin",
    email: "admin@artverse.com",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    createdAt: "2020-01-01T00:00:00Z",
    likedArtworks: []
  }
];

// Sample comments data
export const comments: Comment[] = [
  {
    id: "1",
    artworkId: "1",
    userId: "4",
    text: "The use of blue tones creates such a calming effect. I can almost feel the serenity.",
    createdAt: "2022-06-20T13:45:00Z"
  },
  {
    id: "2",
    artworkId: "1",
    userId: "2",
    text: "Masterful command of color gradients. The composition draws you in deeper with each viewing.",
    createdAt: "2022-06-22T10:30:00Z"
  },
  {
    id: "3",
    artworkId: "3",
    userId: "3",
    text: "The way light filters through the trees feels almost magical. Beautiful work!",
    createdAt: "2020-08-10T15:20:00Z"
  },
  {
    id: "4",
    artworkId: "6",
    userId: "4",
    text: "I'm fascinated by how you've balanced chaotic elements with structured forms. This speaks to me on many levels.",
    createdAt: "2021-03-18T09:15:00Z"
  },
  {
    id: "5",
    artworkId: "2",
    userId: "1",
    text: "The reflections create a wonderful sense of depth. What time of day was this captured?",
    createdAt: "2021-12-03T14:50:00Z"
  }
];

// Function to initialize the local storage with our sample data
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('artworks')) {
    localStorage.setItem('artworks', JSON.stringify(artworks));
  }
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  if (!localStorage.getItem('comments')) {
    localStorage.setItem('comments', JSON.stringify(comments));
  }
};
