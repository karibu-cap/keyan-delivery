
'use client'
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Store, Pill, ChevronRight, Truck, Clock, MapPin, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useT } from '@/hooks/use-inline-translation';
import Link from "next/link";
import { ROUTES } from '@/lib/router';
import { AuthModal } from './auth/AuthModal';



export default function DynamicHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = useT()

  const merchantTypes = [
    {
      type: 'grocery',
      icon: ShoppingBag,
      emoji: '🥬',
      title: t("Fresh Groceries"),
      subtitle: t("Delivered to Your Door"),
      description: t("Farm-fresh produce, pantry essentials, and daily necessities delivered in minutes."),
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      accentColor: 'bg-emerald-400',
      textColor: 'text-emerald-100',
      buttonBg: 'bg-white',
      buttonText: 'text-emerald-600',
      buttonHover: 'hover:bg-emerald-50',
      stats: { stores: '200+', avgTime: t("{min} min", { min: 25 }), items: '5K+' },
      image: '/hero_1.jpeg'
    },
    {
      type: 'food',
      icon: Store,
      emoji: '🍕',
      title: t("Delicious Food"),
      subtitle: t("Hot & Fresh Always"),
      description: t("Your favorite restaurants and local eateries, delivering happiness one meal at a time."),
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      accentColor: 'bg-orange-400',
      textColor: 'text-orange-100',
      buttonBg: 'bg-white',
      buttonText: 'text-orange-600',
      buttonHover: 'hover:bg-orange-50',
      stats: { stores: '150+', avgTime: t("{min} min", { min: 30 }), items: '3K+' },
      image: '/hero_2.jpeg'
    },
    {
      type: 'pharmacy',
      icon: Pill,
      emoji: '💊',
      title: t("Healthcare Essentials"),
      subtitle: t("Trusted & Reliable"),
      description: t("Prescription medications, health products, and wellness items delivered with care."),
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      accentColor: 'bg-cyan-400',
      textColor: 'text-cyan-100',
      buttonBg: 'bg-white',
      buttonText: 'text-cyan-600',
      buttonHover: 'hover:bg-cyan-50',
      stats: { stores: '150+', avgTime: t("{min} min", { min: 20 }), items: '2K+' },
      image: '/hero_3.jpeg'
    }
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % merchantTypes.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const current = merchantTypes[currentIndex];
  const nextIndex = (currentIndex + 1) % merchantTypes.length;
  const next = merchantTypes[nextIndex];
  const IconComponent = current.icon;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Gradient with Color Transition */}
      <div className="absolute inset-0">
        {/* Current Background - Fading Out */}
        <motion.div
          key={`current-${currentIndex}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`}
        />

        {/* Next Background - Fading In */}
        <motion.div
          key={`next-${nextIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${next.gradient}`}
        />
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-8rem)]">

          {/* Left Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="text-white space-y-6 sm:space-y-8 order-2 lg:order-1"
            >

              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block"
              >
                <span className="bg-white/20 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 border border-white/30">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t("Fast & Reliable Delivery")}
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                className="space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {current.title}
                  <br />
                  <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {current.subtitle}
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 leading-relaxed max-w-xl">
                  {current.description}
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.button
                  className={`${next.buttonBg} ${next.buttonText} ${next.buttonHover} px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center justify-center gap-2 w-full sm:w-auto`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/stores">
                    {t("Start Shopping")}
                  </Link>

                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <AuthModal redirectTo={ROUTES.newMerchant}>
                  <motion.button
                    className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("Become a Merchant")}
                  </motion.button>
                </AuthModal>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {[
                  { value: current.stats.stores, label: t("Partner Stores") },
                  { value: current.stats.items, label: t("Products") },
                  { value: current.stats.avgTime, label: t("Avg Delivery") }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="space-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1), duration: 0.5 }}
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stat.value}</div>
                    <div className="text-white/80 text-xs sm:text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Slide Indicators and Controls */}
              <motion.div
                className="flex items-center gap-3 sm:gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {/* Slide Indicators */}
                <div className="flex gap-2 sm:gap-3">
                  {merchantTypes.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-10 sm:w-12 bg-white' : 'w-6 sm:w-8 bg-white/40'
                        }`}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                    />
                  ))}
                </div>

                {/* Pause/Play Button */}
                <motion.button
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 sm:p-2.5 text-white hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={isPaused ? t("Play slideshow") : t("Pause slideshow")}
                >
                  {isPaused ? (
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Right Visual - Image Section */}
          <div className="relative order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: -5 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20 blur-3xl rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Main Image Card */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl">

                  {/* Product Image */}
                  <motion.div
                    className="relative w-full aspect-[4/3] rounded-xl sm:rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Floating emoji */}
                    <motion.div
                      className="absolute -top-3 -right-3 text-3xl sm:text-4xl lg:text-5xl"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {current.emoji}
                    </motion.div>
                  </motion.div>

                  {/* Icon Badge */}
                  <motion.div
                    className={`${next.accentColor} w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-2xl mx-auto`}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ duration: 0.3 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </motion.div>

                  {/* Features */}
                  <div className="space-y-3 sm:space-y-4">
                    <motion.h3
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 text-center lg:text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {t("Why Choose Us")}
                    </motion.h3>

                    {[
                      { icon: Clock, text: t("Express delivery in minutes") },
                      { icon: MapPin, text: t("Track your order in real-time") },
                      { icon: Truck, text: t("Contactless delivery available") }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 sm:gap-4 text-white/90"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                        whileHover={{ x: 8 }}
                      >
                        <div className={`${next.accentColor} w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decorative floating cards - Hidden on mobile */}
                <motion.div
                  className="hidden lg:block absolute -bottom-4 -left-4 xl:-bottom-6 xl:-left-6 bg-white/10 backdrop-blur-xl rounded-lg xl:rounded-xl p-3 xl:p-4 border border-white/20 shadow-xl"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-white/90 text-xs font-medium mb-1">{t("Active Orders")}</div>
                  <div className="text-xl xl:text-2xl font-bold text-white">1,247</div>
                </motion.div>

                <motion.div
                  className="hidden lg:block absolute -top-4 -right-4 xl:-top-6 xl:-right-6 bg-white/10 backdrop-blur-xl rounded-lg xl:rounded-xl p-3 xl:p-4 border border-white/20 shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-white/90 text-xs font-medium mb-1">{t("Online Stores")}</div>
                  <div className="text-xl xl:text-2xl font-bold text-white">500+</div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute -bottom-4 left-0 right-0">
        <svg viewBox="0 0 1440 130" className="w-full h-auto" preserveAspectRatio="none">
          <path
            fill="white"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </div>
  );
}