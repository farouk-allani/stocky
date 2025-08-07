import { Button } from "@/components/ui/button";
import { Leaf, Menu } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Stocky</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#solution" className="text-foreground hover:text-primary transition-colors">Solution</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
          </div>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">
              Sign In
            </Button>
            <Button variant="default">
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors py-2">Features</a>
              <a href="#solution" className="text-foreground hover:text-primary transition-colors py-2">Solution</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors py-2">Pricing</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors py-2">About</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="justify-start">
                  Sign In
                </Button>
                <Button variant="default" className="justify-start">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}