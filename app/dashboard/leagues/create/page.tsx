import { CreateLeagueForm } from "@/components/Dashboard/create-league-form"

export default function CreateLeaguePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create a New League</h1>
      <CreateLeagueForm />
    </div>
  )
}

