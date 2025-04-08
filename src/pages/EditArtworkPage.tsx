
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditArtwork from "@/components/EditArtwork";

const EditArtworkPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <EditArtwork />
      </main>
      <Footer />
    </div>
  );
};

export default EditArtworkPage;
