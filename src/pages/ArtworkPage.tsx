
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtworkDetail from "@/components/ArtworkDetail";

const ArtworkPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ArtworkDetail />
      </main>
      <Footer />
    </div>
  );
};

export default ArtworkPage;
