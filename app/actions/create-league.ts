'use server'

import { z } from "zod"
import { revalidatePath } from "next/cache"

const createLeagueSchema = z.object({
  league_name: z.string().min(3, "League name must be at least 3 characters long"),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  draft_start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  format: z.enum(["Regular Snake", "3rd Round Reversal Snake"]),
})

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>

export async function createLeague(input: CreateLeagueInput) {
  const validatedInput = createLeagueSchema.parse(input)

  try {
    const response = await fetch('/api/leagues/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedInput),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create league')
    }

    const data = await response.json()
    revalidatePath('/dashboard/leagues')
    return { leagueId: data.leagueId }
  } catch (error) {
    console.error('Error creating league:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

