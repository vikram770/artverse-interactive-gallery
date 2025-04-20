
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UploadPage from "@/pages/UploadPage";
import ArtworkPage from "@/pages/ArtworkPage";
import EditArtworkPage from "@/pages/EditArtworkPage";
import NotFound from "@/pages/NotFound";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/artwork/:id" element={<ArtworkPage />} />
        <Route path="/edit/:id" element={<EditArtworkPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
      </Routes>
    </Router>
  );
};

export default App;
