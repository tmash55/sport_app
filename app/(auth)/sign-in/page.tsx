"use client"

import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import config from "@/config";
import AuthForm from "@/components/Auth/AuthForm";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleAuthSuccess = (userId: string) => {
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Sign in to {config.appName}
        </h1>
        <AuthForm type="signin" onSuccess={handleAuthSuccess} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

