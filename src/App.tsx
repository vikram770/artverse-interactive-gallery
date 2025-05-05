
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UploadPage from "@/pages/UploadPage";
import ArtworkPage from "@/pages/ArtworkPage";
import EditArtworkPage from "@/pages/EditArtworkPage";
import NotFound from "@/pages/NotFound";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import ArtistsPage from "@/pages/ArtistsPage";
import ExhibitionsPage from "@/pages/ExhibitionsPage";
import ArtistDetailPage from "@/pages/ArtistDetailPage";
import EditProfilePage from "@/pages/EditProfilePage";
import GalleryView3D from "@/pages/GalleryView3D";
import ExhibitionDetailPage from "@/pages/ExhibitionDetailPage";
import ArtistDashboardPage from "@/pages/ArtistDashboardPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/artwork/:id" element={<ArtworkPage />} />
        <Route path="/edit/:id" element={<EditArtworkPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistDetailPage />} />
        <Route path="/exhibitions" element={<ExhibitionsPage />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
        <Route path="/gallery3d" element={<GalleryView3D />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard" element={<ArtistDashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
