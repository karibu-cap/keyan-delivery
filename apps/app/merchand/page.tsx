"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Merchant = () => {
  const [isOnboarded, setIsOnboarded] = useState(true); // Mock: true for demo

  const stats = [
    { label: "Total Products", value: "156", icon: Package, change: "+12%" },
    { label: "Monthly Revenue", value: "$12,450", icon: DollarSign, change: "+18%" },
    { label: "Orders Today", value: "24", icon: TrendingUp, change: "+5%" },
    { label: "Store Rating", value: "4.8", icon: Store, change: "★" },
  ];

  const products = [
    {
      id: 1,
      name: "Fresh Organic Apples",
      price: 4.99,
      stock: 45,
      status: "approved",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Whole Milk",
      price: 3.49,
      stock: 22,
      status: "approved",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Premium Coffee Beans",
      price: 12.99,
      stock: 0,
      status: "pending",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "Organic Honey",
      price: 8.99,
      stock: 18,
      status: "draft",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784098?w=100&h=100&fit=crop",
    },
  ];

  const handleProductSubmit = () => {
    toast.success("Product submitted for review", {
      description: "Admin will review your product within 24 hours",
    });
  };

  const statusColors = {
    approved: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    draft: "bg-muted text-muted-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const statusIcons = {
    approved: CheckCircle,
    pending: Clock,
    draft: Edit,
    rejected: XCircle,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Merchant Dashboard</h1>
            <p className="text-xl text-white/90 mb-6">
              Manage your store, products, and orders all in one place
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
        {/* Stats Grid */}
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

        {/* Products Section */}
        <Card className="p-6 rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Products</h2>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-2xl shadow-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the product details. You can save as draft or submit for review.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" placeholder="e.g., Fresh Organic Apples" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fruits">Fruits & Vegetables</SelectItem>
                          <SelectItem value="dairy">Dairy & Eggs</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input id="price" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input id="stock" type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" placeholder="e.g., per kg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Photos (up to 5)</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center"
                        >
                          {i === 0 ? <Camera className="w-6 h-6 text-muted-foreground" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 rounded-2xl">
                      Save as Draft
                    </Button>
                    <Button
                      className="flex-1 rounded-2xl shadow-primary"
                      onClick={handleProductSubmit}
                    >
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Products Table */}
          <div className="space-y-3">
            {products.map((product) => {
              const StatusIcon = statusIcons[product.status as keyof typeof statusIcons];
              
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:shadow-card transition-all"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>${product.price}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>

                  <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {product.status}
                  </Badge>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Merchant;