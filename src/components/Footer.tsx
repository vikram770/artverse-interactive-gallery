
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gallery-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-display font-bold mb-4">ArtVerse</h2>
            <p className="text-gray-300 mb-4">
              Discover and connect with the best digital art from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-gray-300 hover:text-white transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/exhibitions" className="text-gray-300 hover:text-white transition-colors">
                  Exhibitions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Join</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/login?register=true" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-300 hover:text-white transition-colors">
                  Submit Artwork
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center md:text-left">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} ArtVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
