import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Navigation from "./components/Navigation";
import Homepage from "./pages/Homepage";
import ProgrammeDetails from "./pages/ProgrammeDetails";
import Curriculum from "./pages/Curriculum";
import Gallery from "./pages/Gallery";
import Enrolment from "./pages/Enrolment";
import Contact from "./pages/Contact";
import Assessment from "./pages/Assessment";
import ParentalEngagement from "./pages/ParentalEngagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/programme-details" element={<ProgrammeDetails />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/parental-engagement" element={<ParentalEngagement />} />
              <Route path="/enrolment" element={<Enrolment />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
