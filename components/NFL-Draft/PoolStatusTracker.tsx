"use client"
import { Circle } from "lucide-react"

type Phase = "pre_draft" | "entries_locked" | "scoring_in_progress" | "final_standings"

interface PoolStatusTrackerProps {
  currentPhase: Phase
}

const phases: { id: Phase; label: string }[] = [
  { id: "pre_draft", label: "Pre-Draft" },
  { id: "entries_locked", label: "Entries\nLocked" },
  { id: "scoring_in_progress", label: "Scoring" },
  { id: "final_standings", label: "Final\nStandings" },
]

export function PoolStatusTracker({ currentPhase }: PoolStatusTrackerProps) {
  const currentPhaseIndex = phases.findIndex((phase) => phase.id === currentPhase)

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index <= currentPhaseIndex ? "border-blue-500 bg-blue-500/20" : "border-gray-600 bg-gray-800"
              }`}
            >
              <Circle
                className={`w-2.5 h-2.5 ${
                  index <= currentPhaseIndex ? "fill-blue-500 text-blue-500" : "fill-gray-600 text-gray-600"
                }`}
              />
            </div>
            <div className="absolute w-[140px] text-center mt-10 -ml-[70px]">
              <p
                className={`text-sm whitespace-pre-line ${index <= currentPhaseIndex ? "text-white" : "text-gray-400"}`}
              >
                {phase.label}
              </p>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`absolute top-4 left-8 w-[calc(100vw/5)] h-[2px] ${
                  index < currentPhaseIndex ? "bg-blue-500" : "bg-gray-600"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

