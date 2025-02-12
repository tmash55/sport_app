"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import config from "@/config"
import AuthForm from "@/components/Auth/AuthForm"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleAuthSuccess = (userId: string) => {
    if (redirect) {
      router.push(redirect)
    } else {
      router.push("/dashboard/my-pools")
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left column - AuthForm */}
      <div className="w-full md:w-[50%] flex flex-col justify-center p-8 relative">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Sign in to {config.appName}</h1>
          <AuthForm type="signin" onSuccess={handleAuthSuccess} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right column - Animated Icon watermark */}
      <div className="hidden md:flex md:w-[50%] relative overflow-hidden bg-background/50">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <motion.div
            className="relative w-full aspect-square mb-8"
            animate={{
              y: [0, 15, -5, 15, 0],
              x: [-5, 5, -3, 5, -5],
              rotate: [-2, 1, -1, 2, -2],
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            <Image
              src="/icon.png"
              alt="Logo Watermark"
              fill
              className="object-contain opacity-20 invert dark:invert-0"
              priority
            />
          </motion.div>
         
        </div>

        {/* Grid background - visible only in dark mode */}
        <div className="absolute inset-0 dark:block hidden -z-10">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_120%,transparent_70%,#000_100%)]" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 -z-10" aria-hidden="true" />
      </div>

      {/* Background elements for mobile */}
      <div className="absolute inset-0 md:hidden -z-10">
        <div className="absolute inset-0 dark:block hidden">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_120%,transparent_70%,#000_100%)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" aria-hidden="true" />
      </div>
    </div>
  )
}

