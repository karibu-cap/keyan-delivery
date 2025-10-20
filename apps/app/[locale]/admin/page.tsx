"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Admin = () => {
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);


  const stats = [
    { label: "Total Stores", value: "156", icon: Store, change: "+12" },
    { label: "Active Drivers", value: "89", icon: Users, change: "+5" },
    { label: "Today's Orders", value: "342", icon: ShoppingCart, change: "+24" },
    { label: "Revenue", value: "$45.2K", icon: TrendingUp, change: "+18%" },
  ];

  const pendingProducts = [
    {
      id: 1,
      name: "Premium Coffee Beans",
      merchant: "Fresh Market",
      price: 12.99,
      submitted: "2 hours ago",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Organic Honey",
      merchant: "Health Store",
      price: 8.99,
      submitted: "5 hours ago",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784098?w=100&h=100&fit=crop",
    },
  ];

  const pendingDrivers = [
    {
      id: 1,
      name: "John Mukiza",
      area: "Kigali Central",
      submitted: "1 day ago",
      documents: ["ID Card", "License", "Insurance"],
    },
    {
      id: 2,
      name: "Marie Uwase",
      area: "Remera",
      submitted: "2 days ago",
      documents: ["ID Card", "License"],
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "urgent",
      message: "Low stock alert: Fresh Milk at Store #23",
      time: "10 min ago",
    },
    {
      id: 2,
      type: "info",
      message: "New merchant registration: primary Valley Organic",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "warning",
      message: "Driver #45 reported delivery delay",
      time: "2 hours ago",
    },
  ];

  const handleApprove = (type: string, item: any) => {
    toast.success(`${type} approved`, {
      description: `${item.name} has been approved successfully`,
    });
    setReviewDialog(false);
  };

  const handleReject = (type: string, item: any) => {
    toast.error(`${type} rejected`, {
      description: `Rejection notification sent to ${item.name}`,
    });
    setReviewDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="gradient-hero py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Admin Portal</h1>
            <p className="text-xl text-white/90">
              Manage stores, drivers, and platform operations
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6 rounded-2xl shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="products" className="rounded-2xl">
              Product Reviews
            </TabsTrigger>
            <TabsTrigger value="drivers" className="rounded-2xl">
              Driver Approvals
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-2xl">
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Product Reviews Tab */}
          <TabsContent value="products">
            <Card className="p-6 rounded-2xl shadow-card">
              <h2 className="text-2xl font-bold mb-6">Pending Product Reviews</h2>
              <div className="space-y-4">
                {pendingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>by {product.merchant}</span>
                        <span>•</span>
                        <span>${product.price}</span>
                        <span>•</span>
                        <span>{product.submitted}</span>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-warning border-warning">
                      Pending
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl"
                        onClick={() => {
                          setSelectedItem({ ...product, type: "product" });
                          setReviewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApprove("Product", product)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject("Product", product)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Driver Approvals Tab */}
          <TabsContent value="drivers">
            <Card className="p-6 rounded-2xl shadow-card">
              <h2 className="text-2xl font-bold mb-6">Pending Driver Approvals</h2>
              <div className="space-y-4">
                {pendingDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-white text-2xl font-bold">
                      {driver.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{driver.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{driver.area}</span>
                        <span>•</span>
                        <span>{driver.submitted}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {driver.documents.map((doc) => (
                          <Badge key={doc} variant="secondary" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Badge variant="outline" className="text-warning border-warning">
                      Pending
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl"
                        onClick={() => {
                          setSelectedItem({ ...driver, type: "driver" });
                          setReviewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApprove("Driver", driver)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject("Driver", driver)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="p-6 rounded-2xl shadow-card">
              <h2 className="text-2xl font-bold mb-6">Recent Alerts</h2>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl ${alert.type === "urgent"
                      ? "bg-destructive/10 border border-destructive/20"
                      : alert.type === "warning"
                        ? "bg-warning/10 border border-warning/20"
                        : "bg-accent border border-border"
                      }`}
                  >
                    <AlertCircle
                      className={`w-5 h-5 mt-0.5 ${alert.type === "urgent"
                        ? "text-destructive"
                        : alert.type === "warning"
                          ? "text-warning"
                          : "text-primary"
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-2xl">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review {selectedItem?.type === "product" ? "Product" : "Driver"}</DialogTitle>
            <DialogDescription>
              Review and provide feedback for approval or rejection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedItem && (
              <>
                <div className="text-lg font-semibold">{selectedItem.name}</div>
                <Textarea
                  placeholder="Add feedback or notes..."
                  rows={4}
                />
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => selectedItem && handleReject(selectedItem.type, selectedItem)}
            >
              Reject
            </Button>
            <Button
              className="rounded-2xl shadow-primary"
              onClick={() => selectedItem && handleApprove(selectedItem.type, selectedItem)}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;