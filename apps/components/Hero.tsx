import { ShoppingBag, Store, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/router";

const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-24 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgOS45NCA4LjA2IDE4IDE4IDE4czE4LTguMDYgMTgtMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                🚀 Fast & Reliable Delivery
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Everything You Need,
              <br />
              <span className="text-primary-light">Delivered Fast</span>
            </h1>

            <p className="text-xl text-white/90 leading-relaxed">
              Groceries, pharmacy, and food delivery in minutes. Your neighborhood stores,
              now at your fingertips.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 rounded-2xl"
              >
                <Link href="/stores">
                  Start Shopping
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:text-white bg-primary hover:bg-primary px-8 rounded-2xl"
              >
                <Link href={ROUTES.newMerchant}>
                  Become a Merchant
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/80">Partner Stores</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-white/80">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">30min</div>
                <div className="text-white/80">Avg Delivery</div>
              </div>
            </div>
          </div>

          {/* Right illustration */}
          <div className="relative lg:block hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-full transform rotate-12"></div>
            <div className="relative grid grid-cols-3 gap-4 p-8">
              {/* Service cards with bounce animation */}
              {[
                { icon: ShoppingBag, label: "Groceries", color: "bg-white" },
                { icon: Pill, label: "Pharmacy", color: "bg-primary-light" },
                { icon: Store, label: "Food", color: "bg-white" },
              ].map((service, i) => (
                <div
                  key={service.label}
                  className={`${service.color} rounded-2xl p-6 shadow-2xl transform hover:scale-110 transition-all duration-300 animate-slide-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <service.icon className={`w-12 h-12 ${service.color === "bg-white" ? "text-primary" : "text-white"} mb-2`} />
                  <div className={`text-sm font-semibold ${service.color === "bg-white" ? "text-primary" : "text-white"}`}>
                    {service.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="hsl(var(--background))"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;