
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import { initializeStores } from "@/lib/store";

const Index = () => {
  useEffect(() => {
    // Initialize localStorage and stores on first load
    initializeStores();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Gallery />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
