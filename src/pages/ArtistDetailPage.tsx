
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistDetail from "@/components/ArtistDetail";

const ArtistDetailPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ArtistDetail />
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDetailPage;
