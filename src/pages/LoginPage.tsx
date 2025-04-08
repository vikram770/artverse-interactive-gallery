
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForms from "@/components/AuthForms";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AuthForms />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
