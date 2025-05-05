
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistDashboard from "@/components/dashboard/ArtistDashboard";

const ArtistDashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ArtistDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDashboardPage;
