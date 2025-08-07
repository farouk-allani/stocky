import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, MapPin, Star, DollarSign, Percent } from "lucide-react";

export function ConsumerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Give some time for auth state to load from localStorage
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      
      // Only redirect if we're sure there's no user after auth check is complete
      if (!user || user.role !== 'CONSUMER') {
        navigate('/');
      }
    }, 500); // Give 500ms for auth state to initialize

    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (isCheckingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Stocky Market</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Consumer</Badge>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for discounted products near you..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button>
                <MapPin className="h-4 w-4 mr-2" />
                Near Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">On purchases</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Deals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Featured Deals</CardTitle>
            <CardDescription>Best discounts near you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deals available yet.</p>
              <p className="text-sm">Check back later for amazing discounts!</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find Nearby Stores
              </CardTitle>
              <CardDescription>
                Discover businesses offering discounted products near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Explore Map
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                My Favorites
              </CardTitle>
              <CardDescription>
                View your saved stores and preferred products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Favorites
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your purchase history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet.</p>
              <p className="text-sm">Start shopping to see your purchase history!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
