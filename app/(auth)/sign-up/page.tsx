import Link from "next/link";

import config from "@/config";
import AuthForm from "@/components/Auth/AuthForm";

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create an account on {config.appName}
        </h1>
        <AuthForm type="signup" />
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