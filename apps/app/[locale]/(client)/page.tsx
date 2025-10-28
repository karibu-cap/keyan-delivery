import Hero from "@/components/Hero";
import { HomePageClient } from "@/components/home/HomePageClient";
import Link from "next/link";
import { Suspense } from "react";

// Enable revalidation every hour
export const revalidate = 3600;

/**
 * HomePage component
 * 
 * This component renders the homepage of the application.
 * It includes a Hero component and a HomePageClient component.
 * The Hero component is a suspense boundary that displays a loading animation until the data is fetched.
 * The HomePageClient component is a server component that fetches data from the API and renders the homepage.
 */
export default async function HomePage() {
     return (
          <div className="min-h-screen bg-background">
               <Suspense fallback={<div className="h-screen bg-background animate-pulse" />}>
                    <Hero />
                    <Link href={"/admin"}>
                         admin
                    </Link>
               </Suspense>
               <HomePageClient />
          </div >
     );
}
