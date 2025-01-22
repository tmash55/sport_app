"use client"
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import config from "@/config";
import AuthForm from "@/components/Auth/AuthForm";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const handleAuthSuccess = (userId: string) => {
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/dashboard/my-pools');
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create an account on {config.appName}
        </h1>
        <AuthForm type="signup" onSuccess={handleAuthSuccess}/>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}