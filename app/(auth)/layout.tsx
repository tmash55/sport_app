import { type ReactNode, Suspense } from "react"
import config from "@/config"
import { getSEOTags } from "@/libs/seo"
import { AuthSkeleton } from "@/components/Auth/AuthSkeleton"

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
})

export default function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AuthSkeleton />}>{children}</Suspense>}

