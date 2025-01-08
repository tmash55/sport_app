import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-20 text-center">
        <h1 className="text-4xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
          March Madness Fantasy
        </h1>
        <p className="text-xl sm:text-2xl text-neutral-500 dark:text-neutral-400 mb-8">
          A new way to enjoy the tournament
        </p>
        <Button size="lg" className="text-lg">
          Get Started
        </Button>
      </div>
    </div>
  );
}
