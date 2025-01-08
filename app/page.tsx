import { Navbar } from "@/components/homepage/navbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import LampDemo from "@/components/ui/lamp";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <LampDemo />
      </div>
      <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <p className="text-sm text-gray-500">© 2024 March Madness Fantasy</p>
        <ThemeToggle />
      </footer>
    </main>
  );
}
