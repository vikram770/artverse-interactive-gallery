
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadArtwork from "@/components/UploadArtwork";

const UploadPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <UploadArtwork />
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;
