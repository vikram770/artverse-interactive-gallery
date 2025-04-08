
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery3D from "@/components/Gallery3D";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GalleryView3D = () => {
  const { filteredArtworks } = useGalleryStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="fixed top-20 left-4 z-10 flex space-x-4">
        <Link to="/">
          <Button variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Loading 3D Gallery</h2>
            <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Preparing your immersive art experience...</p>
          </div>
        </div>
      ) : (
        <main className="flex-grow relative">
          <Gallery3D artworks={filteredArtworks} />
        </main>
      )}
      
      <Footer />
    </div>
  );
};

export default GalleryView3D;
