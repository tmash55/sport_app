import Link from "next/link";

import config from "@/config";
import AuthForm from "@/components/Auth/AuthForm";

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Sign in to {config.appName}
        </h1>
        <AuthForm type="signin" />
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