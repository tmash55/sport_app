import ResetPasswordForm from "@/components/Auth/reset-password-form";
import { Navigation } from "@/components/Navigation";


export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto py-24 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
        <ResetPasswordForm />
      </main>
    </div>
  )
}

