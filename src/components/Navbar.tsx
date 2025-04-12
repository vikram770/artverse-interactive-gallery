
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Upload, User, LogOut } from "lucide-react";
import SearchBar from "./SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // Fetch profile when auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );
    
    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };
  
  const handleLogout = async () => {
    try {
      closeMenu();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };
  
  const isAuthenticated = !!user;
  const isArtist = profile?.role === 'artist' || profile?.role === 'admin';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center mr-8" onClick={closeMenu}>
          <span className="text-2xl font-bold">ArtVerse</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6 mr-auto">
          <Link 
            to="/" 
            className={`text-sm font-medium ${isActive('/') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Gallery
          </Link>
          <Link 
            to="/artists" 
            className={`text-sm font-medium ${isActive('/artists') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Artists
          </Link>
          <Link 
            to="/exhibitions" 
            className={`text-sm font-medium ${isActive('/exhibitions') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Exhibitions
          </Link>
        </div>
        
        <div className="hidden md:flex items-center ml-auto space-x-4">
          <SearchBar />
          
          {isAuthenticated ? (
            <>
              {isArtist && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/upload">
                    <Upload className="mr-2 h-4 w-4" /> Upload Artwork
                  </Link>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {profile?.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
        
        <div className="md:hidden ml-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 pb-6 border-t">
          <div className="mb-4">
            <SearchBar />
          </div>
          
          <nav className="flex flex-col space-y-4 mb-6">
            <Link 
              to="/" 
              className={`text-sm font-medium ${isActive('/') ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Gallery
            </Link>
            <Link 
              to="/artists" 
              className={`text-sm font-medium ${isActive('/artists') ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Artists
            </Link>
            <Link 
              to="/exhibitions" 
              className={`text-sm font-medium ${isActive('/exhibitions') ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Exhibitions
            </Link>
          </nav>
          
          {isAuthenticated ? (
            <div className="space-y-2">
              {isArtist && (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/upload" onClick={closeMenu}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Artwork
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/profile" onClick={closeMenu}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <Button size="sm" className="w-full" asChild>
              <Link to="/login" onClick={closeMenu}>Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
