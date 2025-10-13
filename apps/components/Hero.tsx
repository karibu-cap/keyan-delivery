'use client'
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Store, Pill, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/hooks/use-inline-translation';
import { ROUTES } from '@/lib/router';

export default function DynamicHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = useT();

  const merchantTypes = [
    {
      type: 'grocery',
      icon: ShoppingBag,
      title: t('Shop from local groceries, restaurants, and pharmacies in your area. Get your items delivered instantly.'),
      primaryButtonText: t('Start Shopping'),
      secondaryButtonText: t('Become a Merchant'),
      description: t('Fresh produce delivered to your door within minutes of your order.'),
      gradient: 'from-green-100 via-green-200 to-green-500',
      color: '#22c55e',
      image: '/hero_1.jpeg',
      buttonBuyText: t('Buy Groceries'),
      stats: {
        stores: { value: '200+', label: t('Partner Stores') },
        items: { value: '5K+', label: t('Products') },
        time: { value: '25 min', label: t('Avg Delivery') },
      },
    },
    {
      type: 'food',
      icon: Store,
      title: t('Delicious Food Hot & Fresh Always'),
      primaryButtonText: t('Start Shopping'),
      secondaryButtonText: t('Become a Merchant'),
      description: t('Your favorite restaurants and local eateries, delivery hapiness one meal at time.'),
      gradient: 'from-orange-100 via-orange-200 to-orange-500',
      color: '#f97316',
      image: '/hero_2.jpeg',
      buttonBuyText: t('Buy Meals'),
      stats: {
        stores: { value: '150+', label: t('Partner Restaurants') },
        items: { value: '3K+', label: t('Menu Items') },
        time: { value: '30 min', label: t('Avg Delivery') },
      },
    },
    {
      type: 'pharmacy',
      icon: Pill,
      title: t('Healthcare Essentials Trusted & Reliable'),
      primaryButtonText: t('Start Shopping'),
      secondaryButtonText: t('Become a Merchant'),
      description: t('Prescrition medication, health products, and wellness items delivered with care.'),
      gradient: 'from-cyan-100 via-cyan-200 to-cyan-500',
      color: '#06b6d4',
      image: '/hero_3.jpeg',
      buttonBuyText: t('Buy Medications'),
      stats: {
        stores: { value: '120+', label: t('Partner Pharmacies') },
        items: { value: '2K+', label: t('Health Products') },
        time: { value: '20 min', label: t('Avg Delivery') },
      },
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % merchantTypes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isPaused, merchantTypes.length]);

  const current = merchantTypes[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={`desktop-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative min-h-[600px] bg-gradient-to-r ${current.gradient}`}
          >
            <div className="container mx-auto px-8 py-16 grid lg:grid-cols-2 gap-8 items-center">
              {/* Texte à gauche */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-6"
              >
                <h1 className="text-5xl font-bold leading-tight text-gray-900">
                  {current.title}
                </h1>
                <p className="text-gray-700 text-lg">{current.description}</p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/stores">
                    <motion.button
                      style={{ backgroundColor: current.color }}
                      className="text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-all duration-300 inline-flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      {current.primaryButtonText}
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <Link href="/new-merchant">
                    <motion.button
                      className="bg-white text-gray-900 px-8 py-4 rounded-md font-semibold text-lg shadow-md hover:bg-gray-50 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      {current.secondaryButtonText}
                    </motion.button>
                  </Link>
                </div>

                
                <div className="grid grid-cols-3 gap-6 pt-4">
                  {Object.values(current.stats).map((stat, i) => (
                    <div key={i}>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex gap-2">
                    {merchantTypes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10' : 'w-10 bg-gray-300'}`}
                        style={{
                          backgroundColor: i === currentIndex ? 'white' : '#ccc',
                        }}
                      />
                    ))}
                  </div>
                  <motion.button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 transition"
                    whileHover={{ scale: 1.05 }}
                  >
                    {isPaused ? <Play className="w-4 h-4 text-gray-500" /> : <Pause className="w-4 h-4 text-gray-500" />}
                  </motion.button>
                </div>
              </motion.div>

              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image src={current.image} alt={current.type} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-8">
                  <p className="text-2xl font-semibold mb-4 drop-shadow-md max-w-lg">{current.description}</p>
                </div>

                
                <div className="absolute bottom-0 left-0 px-8 pb-8">
                  <Link href={ROUTES.stores.toString()}>
                    <motion.button
                      style={{ backgroundColor: current.color }}
                      className="text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg hover:opacity-90 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      {current.buttonBuyText}
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative bg-gradient-to-r ${current.gradient}`}
          >
            <div className="px-4 py-8">
              <h1 className="text-2xl font-bold mb-4 text-gray-900">{current.title}</h1>

              <Link href={ROUTES.stores.toString()}>
                <motion.button
                  style={{ backgroundColor: current.color }}
                  className="w-full text-white py-3 rounded-xl font-semibold text-base shadow-lg inline-flex items-center justify-center gap-2 mb-3"
                  whileHover={{ scale: 1.02 }}
                >
                  {current.primaryButtonText}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link href={ROUTES.newMerchant.toString()}>
                <motion.button
                  className="bg-white text-gray-900 w-full py-3 rounded-md font-semibold text-base shadow-md border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                >
                  {current.secondaryButtonText}
                </motion.button>
              </Link>

              {/* Stats sur mobile */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {Object.values(current.stats).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[420px]">
              <Image src={current.image} alt={current.type} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              
              <div className="absolute inset-0 flex flex-col justify-center items-start text-white  px-4">
                <p className="text-2xl font-semibold mb-3 drop-shadow-lg">{current.description}</p>
              </div>

              
              <div className="absolute bottom-0 left-0 px-6 pb-6">
                <Link href={ROUTES.stores.toString()}>
                  <motion.button
                    style={{ backgroundColor: current.color }}
                    className="text-white px-5 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 shadow-lg hover:opacity-90 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {current.buttonBuyText}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Indicateurs alignés à gauche */}
            <div className={`px-4 py-6 bg-gradient-to-r ${current.gradient}`}>
              <div className="flex justify-start items-center gap-3">
                <div className="flex gap-2">
                  {merchantTypes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10' : 'w-10 bg-gray-400'}`}
                      style={{
                        backgroundColor: i === currentIndex ? 'white' : '#ccc',
                      }}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-white/40 backdrop-blur-md border border-white/40 text-gray-900 rounded-full p-2 hover:bg-white/60 transition-all duration-300"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
