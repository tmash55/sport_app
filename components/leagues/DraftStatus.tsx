interface DraftStatusProps {
    status: 'pre_draft' | 'in_progress' | 'paused' | 'completed'
    currentPickNumber: number
  }
  
  export function DraftStatus({ status, currentPickNumber }: DraftStatusProps) {
    const renderDraftStatus = () => {
      switch(status) {
        case 'pre_draft':
          return "Draft not started yet"
        case 'in_progress':
          return `In Progress - Current Pick: ${currentPickNumber}`
        case 'paused':
          return `Paused - Last Pick: ${currentPickNumber - 1}`
        case 'completed':
          return "Draft completed"
        default:
          return "Unknown draft status"
      }
    }
  
    return (
      <span className="text-sm font-normal text-muted-foreground">
        {renderDraftStatus()}
      </span>
    )
  }
  
  