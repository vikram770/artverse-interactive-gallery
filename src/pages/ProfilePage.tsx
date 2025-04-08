
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfile from "@/components/UserProfile";

const ProfilePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <UserProfile />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
