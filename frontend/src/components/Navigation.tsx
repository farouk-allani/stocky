import { Button } from "@/components/ui/button";
import { Leaf, Menu } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuthStore } from "@/lib/auth";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuthStore();

  const handleSignIn = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Already signed in, go to dashboard
      if (user.role === "BUSINESS") {
        window.location.href = "/business-dashboard";
      } else {
        window.location.href = "/consumer-dashboard";
      }
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Navigate to dashboard based on user role
      if (user.role === "BUSINESS") {
        window.location.href = "/business-dashboard";
      } else {
        window.location.href = "/consumer-dashboard";
      }
    }
  };

  const handleHowItWorks = () => {
    window.location.href = "/how-it-works";
  };

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
            <a
              href="#problem-solution"
              className="text-foreground hover:text-primary transition-colors"
            >
              Problem & Solution
            </a>
            <a
              href="#features"
              className="text-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#guardian"
              className="text-foreground hover:text-primary transition-colors"
            >
              Guardian
            </a>
            <button
              onClick={handleHowItWorks}
              className="text-foreground hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <a
              href="#target-audience"
              className="text-foreground hover:text-primary transition-colors"
            >
              Audience
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={handleSignIn}>
              {user ? "Dashboard" : "Sign In"}
            </Button>
            <Button variant="default" onClick={handleGetStarted}>
              {user ? "Go to Dashboard" : "Get Started"}
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border">
            <div className="container py-4 space-y-4">
              <a
                href="#problem-solution"
                className="block text-foreground hover:text-primary transition-colors"
              >
                Problem & Solution
              </a>
              <a
                href="#features"
                className="block text-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#guardian"
                className="block text-foreground hover:text-primary transition-colors"
              >
                Guardian
              </a>
              <button
                onClick={handleHowItWorks}
                className="block text-foreground hover:text-primary transition-colors text-left"
              >
                How It Works
              </button>
              <a
                href="#target-audience"
                className="block text-foreground hover:text-primary transition-colors"
              >
                Audience
              </a>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleSignIn}
                  className="justify-start"
                >
                  {user ? "Dashboard" : "Sign In"}
                </Button>
                <Button
                  variant="default"
                  onClick={handleGetStarted}
                  className="justify-start"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    </nav>
  );
}
