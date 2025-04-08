
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistsList from "@/components/ArtistsList";

const ArtistsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ArtistsList />
      </main>
      <Footer />
    </div>
  );
};

export default ArtistsPage;
