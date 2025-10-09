import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ShoppingBag, Clock, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              <Link href="/stores">
                Browse Stores
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 rounded-2xl"
            >
              <Link href="/merchant">
                Partner With Us
              </Link>
            </Button>
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
                <li><Link href="/merchant" className="hover:text-primary transition-colors">Become a Merchant</Link></li>
                <li><Link href="/driver" className="hover:text-primary transition-colors">Become a Driver</Link></li>
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