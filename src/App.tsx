
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArtworkPage from "./pages/ArtworkPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import EditArtworkPage from "./pages/EditArtworkPage";
import ProfilePage from "./pages/ProfilePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artwork/:id" element={<ArtworkPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/edit/:id" element={<EditArtworkPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artist/:id" element={<ArtistDetailPage />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
