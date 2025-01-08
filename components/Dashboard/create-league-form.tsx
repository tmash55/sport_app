'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createLeague } from "@/app/actions/league-actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "League name must be at least 3 characters.",
  }),
})

// Create a custom event for league creation
export const leagueCreatedEvent = new Event('leagueCreated');

export function CreateLeagueForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await createLeague(values.name)
      
      if (result && 'error' in result) {
        throw new Error(result.error)
      }

      if (result && 'leagueId' in result) {
        toast({
          title: "League Created",
          description: `Successfully created league: ${values.name}`,
        })
        // Dispatch the custom event
        window.dispatchEvent(leagueCreatedEvent);
        router.push(`/dashboard/leagues/${result.leagueId}`)
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Error creating league:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>League Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter league name" {...field} />
              </FormControl>
              <FormDescription>
                Choose a unique name for your league.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create League"}
        </Button>
      </form>
    </Form>
  )
}

