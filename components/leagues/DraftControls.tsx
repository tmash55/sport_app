import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface DraftControlsProps {
  draftStatus: 'pre_draft' | 'in_progress' | 'paused' | 'completed'
  onStartDraft: () => void
  onPauseDraft: () => void
  onResumeDraft: () => void
}

export function DraftControls({ draftStatus, onStartDraft, onPauseDraft, onResumeDraft }: DraftControlsProps) {
  const [currentStatus, setCurrentStatus] = useState(draftStatus)

  useEffect(() => {
    setCurrentStatus(draftStatus)
  }, [draftStatus])

  const renderButton = () => {
    switch (currentStatus) {
      case 'pre_draft':
        return <Button onClick={onStartDraft}>Start Draft</Button>
      case 'in_progress':
        return <Button onClick={onPauseDraft}>Pause Draft</Button>
      case 'paused':
        return <Button onClick={onResumeDraft}>Resume Draft</Button>
      case 'completed':
        return <Button disabled>Draft Completed</Button>
      default:
        return null
    }
  }

  return (
    <div className="mb-4 flex justify-end space-x-2">
      {renderButton()}
    </div>
  )
}

