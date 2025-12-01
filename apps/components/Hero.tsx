'use client'
import { useT } from '@/hooks/use-inline-translation'
import { ROUTES } from '@/lib/router'
import animationData from "@/public/assets/confetti_animation.json"
import { MerchantType } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Pause, Pill, Play, ShoppingBag, Store } from 'lucide-react'
import Image from 'next/image'
import Link from "next/link"
import { useEffect, useState } from 'react'
import { useAuthModal } from './auth/AuthModal'
import Lottie from './Lottie'
import { LocationDisplay } from './LocationDisplay'

const LottieComponent = ({
     className = 'w-16',
     loop = true,
     autoplay = true,
}) => <Lottie src={animationData} className={className} autoplay={autoplay} loop={loop} />;

export default function DynamicHeroCarousel() {
     const [currentIndex, setCurrentIndex] = useState(0)
     const [isPaused, setIsPaused] = useState(false)
     const t = useT()
     const { openModal } = useAuthModal()
     const merchantTypes = [
          {
               type: 'grocery',
               icon: ShoppingBag,
               emoji: '🥬',
               title: t('Shop everything you need from town in one app and get it delivered to you in minutes.'),
               subtitle: '',
               description: t('Farm-fresh produce, pantry essentials, and daily necessities delivered in minutes.'),
               imageOverlayText: t('Buy fresh groceries from local stores in your area and get them delivered to you in minutes.'),
               buttonText: t('Get Groceries'),
               buttonRoute: `/stores?merchantType=${MerchantType.GROCERY}`,
               gradient: 'from-green-100 via-green-200 to-green-500',
               accentColor: 'bg-green-300',
               textColor: 'text-gray-800',
               buttonBg: 'bg-green-300',
               buttonTextColor: 'text-gray-800',
               buttonHover: 'hover:bg-green-400',
               stats: { stores: '200+', avgTime: t('{min} min', { min: 25 }), items: '5K+' },
               image: '/hero_1.jpeg',
          },
          {
               type: 'food',
               icon: Store,
               emoji: '🍕',

               title: t('Shop everything you need from town in one app and get it delivered to you in minutes.'),
               subtitle: t('Hot & Fresh Always'),
               description: t('Your favorite restaurants and local eateries, delivering happiness one meal at a time.'),
               imageOverlayText: t('Order delicious meals from restaurants in vour area and get them delivered to you in minutes'),
               buttonText: t('Get Meals'),
               buttonRoute: `/stores?merchantType=${MerchantType.FOOD}`,
               gradient: 'from-orange-100 via-orange-200 to-orange-500',
               accentColor: 'bg-orange-200',
               textColor: 'text-gray-800',
               buttonBg: 'bg-orange-200',
               buttonTextColor: 'text-gray-800',
               buttonHover: 'hover:bg-orange-300',
               stats: { stores: '150+', avgTime: t('{min} min', { min: 30 }), items: '3K+' },
               image: '/hero_2.jpeg',
          },
          {
               type: 'pharmacy',
               icon: Pill,
               emoji: '💊',
               title: t('Shop from local groceries, restaurants, and pharmacies in you area. Get your items delivered to you instantly.'),
               subtitle: t('Trusted & Reliable'),
               description: t('Prescription medications, health products, and wellness items delivered with care.'),
               imageOverlayText: t('Buy prescription meds and health products from trusted pharmacies in vour and get them delivered to you'),
               buttonText: t('Get Medications'),
               buttonRoute: `/stores?merchantType=${MerchantType.PHARMACY}`,
               gradient: 'from-cyan-100 via-cyan-200 to-cyan-500',
               accentColor: 'bg-cyan-300',
               textColor: 'text-gray-800',
               buttonBg: 'bg-cyan-300',
               buttonTextColor: 'text-gray-800',
               buttonHover: 'hover:bg-cyan-400',
               stats: { stores: '150+', avgTime: t('{min} min', { min: 20 }), items: '2K+' },
               image: '/hero_3.jpeg',
          },
     ]

     useEffect(() => {
          if (isPaused) return

          const interval = setInterval(() => {
               setCurrentIndex(prev => (prev + 1) % merchantTypes.length)
          }, 10000)

          return () => clearInterval(interval)
     }, [isPaused, merchantTypes.length])

     const current = merchantTypes[currentIndex]
     const nextIndex = (currentIndex + 1) % merchantTypes.length

     return (
          <div className="relative overflow-hidden">
               <div className="absolute inset-0">
                    {/* Current Background - Fading Out */}
                    <motion.div
                         key={`current-${currentIndex}`}
                         initial={{ opacity: 1 }}
                         animate={{ opacity: 0 }}
                         transition={{ duration: 0.8, ease: 'easeInOut' }}
                         className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`}
                    />

                    {/* Next Background - Fading In */}
                    <motion.div
                         key={`next-${nextIndex}`}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 0.8, ease: 'easeInOut' }}
                         className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`}
                    />
               </div>

               <div className="container mx-auto max-w-7xl sm:px-6 py-6 sm:py-8 lg:py-9 relative">
                    {/* MOBILE LAYOUT */}
                    <div className="lg:hidden px-4 flex flex-col">
                         <AnimatePresence mode="wait">
                              <motion.div
                                   key={`mobile-content-${currentIndex}`}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   transition={{ duration: 0.6, ease: 'easeInOut' }}
                                   className="space-y-4 max-h-screen overflow-hidden"
                              >
                                   <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.5 }}
                                   >

                                        {/* Location Display */}
                                        <LocationDisplay />

                                        <p
                                             className={`${current.textColor} text-base sm:text-base font-bold leading-relaxed`}
                                        >
                                             {current.title}
                                        </p>
                                   </motion.div>
                                   <div className="flex flex-row gap-4 items-center justify-center">
                                        <LottieComponent />
                                        <div className="flex flex-col gap-4 m-auto">
                                             {/* A2: Start Shopping Button */}
                                             <motion.div
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.2, duration: 0.5 }}
                                                  className="flex w-full justify-center"
                                             >
                                                  <Link href={ROUTES.stores} className="block">
                                                       <motion.button
                                                            className={`${current.buttonBg} ${current.textColor} ${current.buttonHover} px-4 py-2.5 rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                       >
                                                            {t('Start Shopping')}
                                                            <ChevronRight className="w-5 h-5" />
                                                       </motion.button>
                                                  </Link>
                                             </motion.div>

                                             {/* A3: Become a Merchant Button */}
                                             <motion.div
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.3, duration: 0.5 }}
                                                  className="flex w-full justify-center"
                                             >
                                                  <motion.button
                                                       className={`bg-white/90 backdrop-blur-sm border-2 border-white/60 ${current.textColor} hover:bg-white px-4 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2`}
                                                       whileHover={{ scale: 1.02 }}
                                                       whileTap={{ scale: 0.98 }}
                                                       onClick={() => openModal(ROUTES.newMerchant)}
                                                  >
                                                       {t('Become a Merchant')}
                                                  </motion.button>
                                             </motion.div>
                                        </div>
                                        <LottieComponent />

                                   </div>

                                   {/* A4: Stats */}
                                   <motion.div
                                        className="grid grid-cols-3 gap-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                   >
                                        {[
                                             { value: current.stats.stores, label: t('Partner Stores') },
                                             { value: current.stats.items, label: t('Products') },
                                             { value: current.stats.avgTime, label: t('Avg Delivery') },
                                        ].map((stat, i) => (
                                             <div key={i} className="text-center space-y-1">
                                                  <div className={`${current.textColor} text-xl sm:text-2xl font-bold`}>
                                                       {stat.value}
                                                  </div>
                                                  <div className={`${current.textColor} text-xs font-medium`}>{stat.label}</div>
                                             </div>
                                        ))}
                                   </motion.div>

                                   {/* A5: Image with overlay */}
                                   <motion.div
                                        className="relative"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                   >
                                        {/* Glow effect */}
                                        <motion.div
                                             className="absolute inset-0 bg-white/20 blur-3xl rounded-full"
                                             animate={{ scale: [1, 1.1, 1] }}
                                             transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />

                                        {/* Main Image Card */}
                                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                             {/* Product Image */}
                                             <div className="relative w-full aspect-[16/10]">
                                                  <Image
                                                       src={current.image}
                                                       alt={current.title}
                                                       fill
                                                       className="w-full h-full object-cover"
                                                  />

                                                  {/* Dark overlay gradient */}
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                                  {/* Floating emoji - Top Right */}
                                                  <motion.div
                                                       className="absolute top-4 right-4 text-4xl sm:text-5xl z-10"
                                                       animate={{
                                                            y: [0, -10, 0],
                                                            rotate: [0, 5, 0, -5, 0],
                                                       }}
                                                       transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                       }}
                                                  >
                                                       {current.emoji}
                                                  </motion.div>

                                                  {/* A6 & A7: Text and Button Overlay - Bottom of Image */}
                                                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                                                       <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.6, duration: 0.5 }}
                                                            className="space-y-10"
                                                       >
                                                            {/* A6: Text Overlay on Image */}
                                                            <h2 className="text-white text-lg sm:text-xl font-bold leading-tight drop-shadow-lg">
                                                                 {current.imageOverlayText}
                                                            </h2>

                                                            {/* A7: Button on Image */}
                                                            <Link href={current.buttonRoute}>
                                                                 <motion.button
                                                                      className={`${current.buttonBg} ${current.textColor} px-4 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2`}
                                                                      whileHover={{ scale: 1.05 }}
                                                                      whileTap={{ scale: 0.95 }}
                                                                 >
                                                                      {current.buttonText}
                                                                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                 </motion.button>
                                                            </Link>
                                                       </motion.div>
                                                  </div>
                                             </div>
                                        </div>
                                   </motion.div>

                                   {/* A8: Slide Controls */}
                                   <motion.div
                                        className="flex items-center justify-start gap-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                   >
                                        {/* Slide Indicators */}
                                        <div className="flex gap-2">
                                             {merchantTypes.map((_, index) => (
                                                  <motion.button
                                                       key={index}
                                                       onClick={() => setCurrentIndex(index)}
                                                       className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-12 bg-gray-800' : 'w-8 bg-gray-400'
                                                            }`}
                                                       whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
                                                  />
                                             ))}
                                        </div>

                                        {/* Pause/Play Button */}
                                        <motion.button
                                             onClick={() => setIsPaused(!isPaused)}
                                             className="bg-white/20 backdrop-blur-sm border border-gray-400 rounded-full p-2.5 hover:bg-white/30 transition-all duration-300 text-gray-800"
                                             whileHover={{ scale: 1.05 }}
                                             whileTap={{ scale: 0.95 }}
                                             title={isPaused ? t('Play slideshow') : t('Pause slideshow')}
                                        >
                                             {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </motion.button>
                                   </motion.div>
                              </motion.div>
                         </AnimatePresence>
                    </div>

                    {/* DESKTOP LAYOUT */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-28 items-center min-h-[calc(100vh-8rem)]">
                         {/* Left Side - Content */}
                         <AnimatePresence mode="wait">
                              <motion.div
                                   key={`desktop-content-${currentIndex}`}
                                   initial={{ opacity: 0, x: -50 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: 50 }}
                                   transition={{ duration: 0.6, ease: 'easeInOut' }}
                                   className={`${current.textColor} space-y-12`}
                              >

                                   {/* A1: Top Text */}
                                   <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.5 }}
                                   >

                                        {/* Location Display */}
                                        <LocationDisplay />
                                        
                                        <p className={`text-xl lg:text-3xl ${current.textColor} font-bold leading-relaxed`}>
                                             {current.title}
                                        </p>
                                        <p className={`text-lg lg:text-3xl ${current.textColor} font-bold leading-relaxed`}>
                                             {current.subtitle}
                                        </p>
                                   </motion.div>

                                   {/* A2: CTA Buttons */}
                                   <div className="flex flex-row gap-4 items-center">
                                        <LottieComponent className='w-12' />
                                        <motion.div
                                             className="flex flex-row gap-4"
                                             initial={{ opacity: 0, y: 20 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             transition={{ delay: 0.2, duration: 0.5 }}
                                        >
                                             <Link href="/stores">
                                                  <motion.button
                                                       className={`${current.buttonBg} ${current.textColor} ${current.buttonHover} px-2 py-4 rounded-md font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-2`}
                                                       whileHover={{ scale: 1.05 }}
                                                       whileTap={{ scale: 0.95 }}
                                                  >
                                                       {t('Start Shopping')}
                                                       <ChevronRight className="w-5 h-5" />
                                                  </motion.button>
                                             </Link>
                                             <motion.button
                                                  className={`bg-white/90 backdrop-blur-sm border-2 border-white/60 ${current.textColor} px-2 hover:bg-white py-4 rounded-md font-semibold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2`}
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => openModal(ROUTES.newMerchant)}
                                             >
                                                  {t('Become a Merchant')}
                                             </motion.button>
                                        </motion.div>
                                        <LottieComponent className='w-12' />
                                   </div>
                                   {/* Stats */}
                                   <motion.div
                                        className="grid grid-cols-3 gap-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                   >
                                        {[
                                             { value: current.stats.stores, label: t('Partner Stores') },
                                             { value: current.stats.items, label: t('Products') },
                                             { value: current.stats.avgTime, label: t('Avg Delivery') },
                                        ].map((stat, i) => (
                                             <motion.div
                                                  key={i}
                                                  className="space-y-1"
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                                             >
                                                  <div className={`${current.textColor} text-3xl lg:text-4xl font-bold`}>
                                                       {stat.value}
                                                  </div>
                                                  <div className={`${current.textColor} text-sm font-medium`}>{stat.label}</div>
                                             </motion.div>
                                        ))}
                                   </motion.div>


                                   {/* A3: Slide Indicators and Controls */}
                                   <motion.div
                                        className="flex items-center gap-4 pt-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                   >
                                        {/* Slide Indicators */}
                                        <div className="flex gap-3">
                                             {merchantTypes.map((_, index) => (
                                                  <motion.button
                                                       key={index}
                                                       onClick={() => setCurrentIndex(index)}
                                                       className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-12 bg-gray-800' : 'w-8 bg-gray-400'
                                                            }`}
                                                       whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
                                                  />
                                             ))}
                                        </div>

                                        {/* Pause/Play Button */}
                                        <motion.button
                                             onClick={() => setIsPaused(!isPaused)}
                                             className="bg-white/20 backdrop-blur-sm border border-gray-400 rounded-full p-2.5 hover:bg-white/30 transition-all duration-300 text-gray-800"
                                             whileHover={{ scale: 1.05 }}
                                             whileTap={{ scale: 0.95 }}
                                             title={isPaused ? t('Play slideshow') : t('Pause slideshow')}
                                        >
                                             {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </motion.button>
                                   </motion.div>
                              </motion.div>
                         </AnimatePresence>

                         {/* Right Side - Image */}
                         <div className="relative">
                              <AnimatePresence mode="wait">
                                   <motion.div
                                        key={`desktop-visual-${currentIndex}`}
                                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, rotate: -5 }}
                                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                                        className="relative"
                                   >
                                        {/* Glow effect */}
                                        <motion.div
                                             className="absolute inset-0 bg-white/20 blur-3xl rounded-full"
                                             animate={{ scale: [1, 1.1, 1] }}
                                             transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />

                                        {/* A4: Main Image Card */}
                                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                             {/* Product Image */}
                                             <div className="relative w-full aspect-[4/3]">
                                                  <Image
                                                       src={current.image}
                                                       alt={current.title}
                                                       fill
                                                       className="w-full h-full object-cover"
                                                  />

                                                  {/* Dark overlay gradient */}
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                                  {/* Floating emoji - Top Right */}
                                                  <motion.div
                                                       className="absolute top-6 right-6 text-6xl z-10"
                                                       animate={{
                                                            y: [0, -10, 0],
                                                            rotate: [0, 5, 0, -5, 0],
                                                       }}
                                                       transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                       }}
                                                  >
                                                       {current.emoji}
                                                  </motion.div>

                                                  {/* A5 & A6: Text and Button Overlay - Bottom of Image */}
                                                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                                                       <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4, duration: 0.5 }}
                                                            className="space-y-12"
                                                       >
                                                            {/* A5: Text Overlay on Image */}
                                                            <h2 className="text-white text-xl lg:text-2xl font-bold leading-tight drop-shadow-lg">
                                                                 {current.imageOverlayText}
                                                            </h2>

                                                            {/* A6: Button on Image */}
                                                            <Link href={current.buttonRoute}>
                                                                 <motion.button
                                                                      className={`${current.buttonBg} ${current.textColor} px-8 py-3.5 rounded-md font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2`}
                                                                      whileHover={{ scale: 1.05 }}
                                                                      whileTap={{ scale: 0.95 }}
                                                                 >
                                                                      {current.buttonText}
                                                                      <ChevronRight className="w-5 h-5" />
                                                                 </motion.button>
                                                            </Link>
                                                       </motion.div>
                                                  </div>
                                             </div>
                                        </div>
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
          </div >
     )
}
