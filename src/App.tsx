
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { testApiConnection, getApiBaseUrl } from "./utils/api";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log("Testing API connection...");
        setIsLoading(true);
        const isConnected = await testApiConnection();
        if (isConnected) {
          console.log("API connection successful");
          toast.success("Connected to backend successfully");
          setConnectionError(null);
        } else {
          console.error("API connection failed");
          const errorMsg = `Failed to connect to backend at ${getApiBaseUrl()}`;
          toast.error(errorMsg);
          setConnectionError(errorMsg);
        }
      } catch (error) {
        console.error("API connection check error:", error);
        const errorMsg = `Error connecting to backend: ${(error as Error).message}`;
        toast.error(errorMsg);
        setConnectionError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiConnection();
  }, []);

  // If there's a connection error, display a retry button
  if (connectionError && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-red-600">Connection Error</h1>
          <p className="text-gray-600">{connectionError}</p>
          <p className="text-sm">
            The application can't connect to the backend server. This might be because:
            <ul className="list-disc text-left pl-5 mt-2">
              <li>The backend server is not running</li>
              <li>The backend URL is incorrect</li>
              <li>There's a network issue</li>
            </ul>
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry Connection
          </Button>
          <p className="text-xs text-gray-500 mt-8">
            Backend URL: {getApiBaseUrl()}
          </p>
        </div>
      </div>
    );
  }

  // If still loading, show a minimal loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

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
