import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Analytics from "./components/Analytics";
import Homepage from "./pages/Homepage";
import ProgrammeDetails from "./pages/ProgrammeDetails";
import Curriculum from "./pages/Curriculum";
// import Gallery from "./pages/Gallery"; // Temporarily disabled to fix infinite loop
import EnhancedGalleryPage from "./pages/EnhancedGalleryPage";
import TempGalleryBlock from "./components/TempGalleryBlock";
import Enrolment from "./pages/Enrolment";
import Contact from "./pages/Contact";
import Assessment from "./pages/Assessment";
import ParentalEngagement from "./pages/ParentalEngagement";
import DebugPage from "./pages/DebugPage";
// import AdminVideoManager from "./components/AdminVideoManager"; // Temporarily disabled to fix infinite loop
import SafeAdminVideoManager from "./components/SafeAdminVideoManager";
import TempAdminVideoManagerBlock from "./components/TempAdminVideoManagerBlock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Analytics />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/programme-details" element={<ProgrammeDetails />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/gallery" element={<EnhancedGalleryPage />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/parental-engagement" element={<ParentalEngagement />} />
              <Route path="/enrolment" element={<Enrolment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/admin" element={<SafeAdminVideoManager />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
