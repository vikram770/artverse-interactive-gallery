
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForms from "@/components/AuthForms";
import { useAuthStore } from "@/lib/store";

const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect authenticated users to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
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
