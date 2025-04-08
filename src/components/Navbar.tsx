
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGalleryStore } from "@/lib/store";
import { Search, User, LogIn, Menu, X } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useGalleryStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-bold text-gallery-dark">
          ArtVerse
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="space-x-2">
            <Link to="/" className="px-3 py-2 text-gray-700 hover:text-gallery-accent">
              Gallery
            </Link>
            <Link to="/artists" className="px-3 py-2 text-gray-700 hover:text-gallery-accent">
              Artists
            </Link>
            <Link to="/exhibitions" className="px-3 py-2 text-gray-700 hover:text-gallery-accent">
              Exhibitions
            </Link>
          </div>
          
          <div className="space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {currentUser?.role === "artist" && (
                  <Link to="/upload">
                    <Button variant="outline">Upload Artwork</Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button onClick={logout} variant="ghost">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg animate-fade-in">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="px-3 py-2 text-gray-700 hover:text-gallery-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              to="/artists" 
              className="px-3 py-2 text-gray-700 hover:text-gallery-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            <Link 
              to="/exhibitions" 
              className="px-3 py-2 text-gray-700 hover:text-gallery-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Exhibitions
            </Link>
            
            {isAuthenticated ? (
              <>
                {currentUser?.role === "artist" && (
                  <Link 
                    to="/upload" 
                    className="px-3 py-2 text-gray-700 hover:text-gallery-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upload Artwork
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="px-3 py-2 text-gray-700 hover:text-gallery-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }} variant="ghost" className="justify-start px-3">
                  Logout
                </Button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-3 py-2 text-gallery-accent font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
