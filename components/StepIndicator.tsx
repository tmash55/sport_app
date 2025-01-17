import { Check } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps: number[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = completedSteps.includes(stepNumber)
        const isCurrent = currentStep === stepNumber

        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ${
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : isCurrent
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 transition-colors duration-200 ${
                  isCompleted ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

