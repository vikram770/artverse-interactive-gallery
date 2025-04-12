import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  LogIn, 
  LogOut, 
  Menu, 
  User, 
  Users, 
  Palette, 
  Upload,
  Home,
  Calendar,
  Box, // Replaced Cube with Box
  Settings
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationIcon from "./notifications/NotificationIcon";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link to="/artists" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                  <Users className="h-5 w-5" />
                  Artists
                </Link>
                <Link to="/exhibitions" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                  <Calendar className="h-5 w-5" />
                  Exhibitions
                </Link>
                <Link to="/gallery3d" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                  <Box className="h-5 w-5" />
                  3D Gallery
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/upload" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                      <Upload className="h-5 w-5" />
                      Upload Artwork
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button 
                      className="flex items-center gap-2 text-lg font-medium text-left"
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 text-lg font-medium" onClick={closeMenu}>
                    <LogIn className="h-5 w-5" />
                    Login / Register
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="hidden md:flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ArtGallery</span>
          </Link>
          
          <Link to="/" className="md:hidden flex items-center">
            <Palette className="h-6 w-6 text-primary" />
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link to="/artists" className="px-3 py-2 text-sm font-medium hover:text-primary">
            Artists
          </Link>
          <Link to="/exhibitions" className="px-3 py-2 text-sm font-medium hover:text-primary">
            Exhibitions
          </Link>
          <Link to="/gallery3d" className="px-3 py-2 text-sm font-medium hover:text-primary">
            3D Gallery
            <Badge className="ml-1 bg-green-500 hover:bg-green-600">New</Badge>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-[200px] lg:w-[300px]">
            <SearchBar />
          </div>
          
          {isAuthenticated ? (
            <>
              <NotificationIcon />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback>
                        {currentUser?.username?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Artwork
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
