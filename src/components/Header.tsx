
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full ai-gradient-bg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="font-bold text-xl">ImgCaption</span>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
