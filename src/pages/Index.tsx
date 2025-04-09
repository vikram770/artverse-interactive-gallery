
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import SearchBar from "@/components/SearchBar";
import QuickUploadButton from "@/components/QuickUploadButton";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold">Digital Art Gallery</h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <SearchBar />
              <QuickUploadButton />
            </div>
          </div>
          <Gallery />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
