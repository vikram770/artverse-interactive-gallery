
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Exhibitions from "@/components/Exhibitions";

const ExhibitionsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Exhibitions />
      </main>
      <Footer />
    </div>
  );
};

export default ExhibitionsPage;
