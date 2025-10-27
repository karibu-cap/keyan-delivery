import { Metadata } from 'next'
import '../../globals.css'
import { Toaster, } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication pages including login, register, and forgot password.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
