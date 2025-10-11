import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ShoppingBag, Clock, Shield, Zap, Store, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/router";
import { AuthModal } from "@/components/auth/AuthModal";

const Index = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "30-minute average delivery time for all your essentials",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "End-to-end encrypted with verified pickup and delivery codes",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Order anytime, anywhere from our network of local stores",
    },
    {
      icon: ShoppingBag,
      title: "Wide Selection",
      description: "Groceries, pharmacy, and food from 500+ partner stores",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Partner CTA Section */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Grow Your Business With Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of merchants and drivers earning with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Become a Merchant */}
            <Card className="p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Become a Merchant</h3>
                <p className="text-muted-foreground mb-6">
                  List your products and reach thousands of customers in your area
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-2 text-left w-full">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Zero upfront costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Easy product management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Get paid weekly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Analytics & insights</span>
                  </li>
                </ul>
                <AuthModal redirectTo={ROUTES.newMerchant}>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 shadow-primary"
                  >
                    Apply as Merchant
                  </Button>
                </AuthModal>

              </div>
            </Card>

            {/* Become a Driver */}
            <Card className="p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Become a Driver</h3>
                <p className="text-muted-foreground mb-6">
                  Earn money on your schedule by delivering orders in your area
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-2 text-left w-full">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Flexible working hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Competitive earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Weekly payouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>24/7 support team</span>
                  </li>
                </ul>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 shadow-primary"
                >
                  <Link href={ROUTES.driverApply}>
                    Apply as Driver
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Keyan?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the most reliable last-mile delivery platform with your convenience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of happy customers enjoying fast, reliable delivery
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg text-lg px-8 rounded-2xl"
            >
              <Link href={ROUTES.stores}>
                Browse Stores
              </Link>
            </Button>
            <AuthModal redirectTo={ROUTES.newMerchant}>
              <Button
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 rounded-2xl"
              >
                Partner With Us
              </Button>
            </AuthModal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-2xl gradient-hero flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">Keyan</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted last-mile delivery partner
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Partners</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/merchant/new-merchant" className="hover:text-primary transition-colors">Become a Merchant</Link></li>
                <li><Link href="/driver/new-driver" className="hover:text-primary transition-colors">Become a Driver</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Keyan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;