
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditProfile from "@/components/EditProfile";

const EditProfilePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <EditProfile />
      </main>
      <Footer />
    </div>
  );
};

export default EditProfilePage;
