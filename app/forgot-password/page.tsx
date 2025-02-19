import { Navigation } from "@/components/Navigation";
import ForgotPasswordForm from "@/components/Auth/forgot-password-form";


export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto py-24 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
      <ForgotPasswordForm />
    </main>
    </div>
  )
}

