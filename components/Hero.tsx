import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { hoop_1 } from '@/public'


export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col-reverse items-center justify-center py-16 px-4 lg:flex-row lg:gap-16 xl:gap-24">
          {/* Left column - Text content */}
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Revolutionize Your March Madness Experience with{' '}
              <span className="text-primary">DraftPlay!</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              A blend of fantasy strategy and the chaos of March Madness—draft, compete, and win big!
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto">
                Join the Contest
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Draft your teams', 'Compete with friends or rivals', 'Earn points for every victory and thrilling upsets'].map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column - Image */}
          <div className="relative mb-8 w-full max-w-2xl lg:mb-0 px-4 sm:px-6 lg:px-8 hidden md:block">
            <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-secondary/30 blur-3xl"></div>
            <div className="relative">
              <Image
                src={hoop_1|| "/placeholder.svg"}
                alt="March Madness Draft Experience"
                width={800}
                height={800}
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

