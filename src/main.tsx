
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("App is initializing... Development mode:", import.meta.env.DEV ? "Yes" : "No");
console.log("Environment:", import.meta.env.MODE);

// Add global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("App rendered successfully");
} else {
  console.error("Root element not found!");
}
