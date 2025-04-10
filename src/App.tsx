
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { testApiConnection, getApiBaseUrl } from "./utils/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const AppContent = () => {
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log("Testing API connection...");
        const isConnected = await testApiConnection();
        if (isConnected) {
          console.log("API connection successful");
          toast.success("Connected to backend successfully");
        } else {
          console.error("API connection failed");
          toast.error(`Failed to connect to backend at ${getApiBaseUrl()}`);
        }
      } catch (error) {
        console.error("API connection check error:", error);
        toast.error(`Error connecting to backend: ${(error as Error).message}`);
      }
    };

    checkApiConnection();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
