import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { StepIndicator } from '@/components/StepIndicator'

interface PageHeaderProps {
  title: string
  subtitle?: string
  currentStep: number
  completedSteps: number[]
  steps: string[]
  showBackButton?: boolean
}

export function PageHeader({ 
  title, 
  subtitle, 
  currentStep, 
  completedSteps,
  steps, 
  showBackButton = false 
}: PageHeaderProps) {
  return (
    <div className="relative space-y-8 mb-8 pt-16">
      {showBackButton && (
        <div className="absolute left-4 top-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )}
      
      
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

