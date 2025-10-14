import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { serviceWorkerManager } from "./services/serviceWorkerManager";

// Initialize service worker for offline functionality
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW) {
  serviceWorkerManager.register().then((success) => {
    if (success) {
      console.log('🚀 Service Worker ready for offline video caching');
      // Register background sync for video updates
      serviceWorkerManager.registerBackgroundSync('sync-featured-videos');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
