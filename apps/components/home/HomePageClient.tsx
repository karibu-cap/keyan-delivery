'use client';

import { useAuthStore } from "@/hooks/use-auth-store";
import { useT } from "@/hooks/use-inline-translation";
import { ROUTES } from "@/lib/router";
import deliveryFoodSplash from "@/public/assets/delivery_food_splash.json";
import eCommerce from "@/public/assets/e_comerce.json";
import fireworks from "@/public/assets/fireworks.json";
import openBusiness from "@/public/assets/open_business.json";
import shopOnline from "@/public/assets/shop_online.json";
import { UserRole } from "@prisma/client";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Shield, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useAuthModal } from "../auth/AuthModal";
import Lottie from "../Lottie";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function HomePageClient() {
    const { user } = useAuthStore();
    const { openModal } = useAuthModal();
    const t = useT();
    const isDriver = user?.driverStatus === "APPROVED" && user?.roles.some(role => role === UserRole.driver);

    const features = [
        {
            icon: Zap,
            title: t("Lightning Fast"),
            description: t("30-minute average delivery time for all your essentials"),
        },
        {
            icon: Shield,
            title: t("Safe & Secure"),
            description: t("End-to-end encrypted with verified pickup and delivery codes"),
        },
        {
            icon: Clock,
            title: t("24/7 Available"),
            description: t("Order anytime, anywhere from our network of local stores"),
        },
        {
            icon: ShoppingBag,
            title: t("Wide Selection"),
            description: t("Groceries, pharmacy, and food from 500+ partner stores"),
        },
    ];

    return (
        <>
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            {t("Grow Your Business With Us")}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("Join thousands of merchants and drivers earning with our platform")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Become a Merchant */}
                        <Card className="p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                            <div className="flex flex-col items-center text-center">
                                <Lottie src={openBusiness} className="w-[160px] " loop={true} autoplay={true} />
                                <h3 className="text-2xl font-bold mb-3">{t("Become a Merchant")}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {t("List your products and reach thousands of customers in your area")}
                                </p>
                                <ul className="text-sm text-muted-foreground mb-6 space-y-2 text-left w-full">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Zero upfront costs")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Easy product management")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Get paid daily")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Analytics & insights")}</span>
                                    </li>
                                </ul>
                                <Button
                                    size="lg"
                                    className="w-full bg-primary hover:bg-primary shadow-primary"
                                    onClick={() => openModal(ROUTES.newMerchant)}
                                >
                                    {t("Apply as Merchant")}
                                </Button>

                            </div>
                        </Card>

                        {/* Become a Driver */}
                        <Card className="p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                            <div className="flex flex-col items-center text-center">
                                <Lottie src={deliveryFoodSplash} className="w-[160px] " loop={true} autoplay={true} />
                                <h3 className="text-2xl font-bold mb-3">{t("Become a Driver")}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {t("Earn money on your schedule by delivering orders in your area")}
                                </p>
                                <ul className="text-sm text-muted-foreground mb-6 space-y-2 text-left w-full">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Flexible working hours")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Competitive earnings")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("Weekly payouts")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>{t("24/7 support team")}</span>
                                    </li>
                                </ul>
                                <Button
                                    size="lg"
                                    className="w-full bg-primary hover:bg-primary shadow-primary"
                                    onClick={() => openModal(isDriver ? ROUTES.driverDashboard : ROUTES.driverApply)}
                                >
                                    {isDriver ? "Go to driver dashboard" : "Apply as Driver"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 pb-4">
                <div className="container mx-auto max-w-7xl flex flex-col justify-center items-center">
                    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                        <Lottie src={eCommerce} className="lg:w-96 w-48" loop={true} autoplay={true} />
                        <div className="text-center mb-16 flex flex-col gap-4 justify-center items-center">
                            <h2 className="text-4xl font-bold text-foreground mb-4">
                                {t("Why Choose Yetu?")}
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {t("PataUpesi is your local shopping and delivery app, where you can order everything you need from nearby stores, restaurants, and pharmacies, and get it delivered to you in minutes.")}
                            </p>
                            <Lottie src={shopOnline} className="w-48 lg:hidden" loop={true} autoplay={true} />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex w-full justify-center"
                            >
                                <Link href={ROUTES.stores} className="block cursor-pointer">
                                    <motion.button
                                        className={`cursor-pointer text-primary-foreground bg-primary px-4 py-2.5 rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t('Start Shopping')}
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>
                        <Lottie src={shopOnline} className="w-96 max-lg:hidden" loop={true} autoplay={true} />
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
            <section className="relative gradient-hero h-80 max-md:h-100">
                <div className="h-full w-full relative overflow-hidden">
                    <Lottie src={fireworks} className="w-64 absolute lg:top-0 lg:bottom-0 flex flex-col justify-center items-center" speed={0.2} />
                    <div className="text-white text-center absolute z-10 h-full w-full justify-items-center">
                        <div className="justify-items-center justify-center flex flex-col lg:max-w-1/2 h-full">
                            <h2 className="text-4xl font-bold mb-6">
                                {t("Ready to Get Started?")}
                            </h2>
                            <p className="text-xl mb-8 text-white/90">
                                {t("Join thousands of customers shopping from local stores and getting their orders delivered fast - only on PataUpesi")}
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 shadow-lg text-lg px-8 rounded-2xl"
                                >
                                    <Link href={ROUTES.stores}>
                                        {t("Browse Stores")}
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 rounded-2xl"
                                    onClick={() => openModal(ROUTES.newMerchant)}
                                >
                                    {t("Partner With Us")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Lottie src={fireworks} className="w-64 absolute lg:top-0 lg:bottom-0 flex flex-col justify-center items-center right-0" speed={0.2} />
                </div>
            </section >

            {/* Footer */}
            < footer className="bg-card border-t border-border py-12 px-4" >
                <div className="container mx-auto max-w-7xl">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 rounded-2xl gradient-hero flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold text-primary">Yetu</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t("Your all-in-one local shopping and delivery platform")}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t("Company")}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/about" className="hover:text-primary transition-colors">{t("About Us")}</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">{t("Contact")}</Link></li>
                                <li><Link href="/careers" className="hover:text-primary transition-colors">{t("Careers")}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t("For Partners")}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/new-merchant" className="hover:text-primary transition-colors">{t("Become a Merchant")}</Link></li>
                                <li><Link href="/driver/new-driver" className="hover:text-primary transition-colors">{t("Become a Driver")}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t("Support")}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/help" className="hover:text-primary transition-colors">{t("Help Center")}</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">{t("Terms of Service")}</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">{t("Privacy Policy")}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        <p>&copy; 2025 Yetu. {t("All rights reserved.")}</p>
                    </div>
                </div>
            </footer >
        </>
    );
}