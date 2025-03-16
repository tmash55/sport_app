"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Settings, DollarSign, Users, Mail } from "lucide-react"

import Link from "next/link"
import { useNflDraft } from "@/app/context/NflDraftContext"

export function CommishHQHeader() {
  const { league } = useNflDraft()
  const [showGettingStarted, setShowGettingStarted] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && league) {
      const storedValue = localStorage.getItem(`commishHQ-gettingStarted-${league.id}`)
      setShowGettingStarted(storedValue !== "hidden")
    }
  }, [league])

  const handleClose = () => {
    setShowGettingStarted(false)
    if (league) {
      localStorage.setItem(`commishHQ-gettingStarted-${league.id}`, "hidden")
    }
  }

  const handleReset = () => {
    setShowGettingStarted(true)
    if (league) {
      localStorage.removeItem(`commishHQ-gettingStarted-${league.id}`)
    }
  }

  if (!league) return null

  // Mock current phase - replace with actual data when available
  const currentPhase = "pre_draft"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Commish HQ</h1>

      

      {showGettingStarted ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Getting Started</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close getting started guide">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Welcome to your Commissioner Headquarters! Before the pool starts, make sure to complete the following
              tasks:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Review and adjust pool settings</li>
              <li>Set up draft preferences and schedule</li>
              <li>Invite others to join your pool</li>
              <li>Configure scoring rules and point systems</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              You can always access these settings and more from the sections below. Good luck with your pool!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={handleReset}>
          Show Getting Started Guide
        </Button>
      )}

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">General Pool Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href={`/dashboard/pools/nfl-draft/${league.id}/commish/settings`} passHref>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <Settings className="w-6 h-6 mr-4 text-primary" />
                  <CardTitle>Pool Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Adjust general pool settings and preferences</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/dashboard/pools/nfl-draft/${league.id}/commish/payment`} passHref>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <DollarSign className="w-6 h-6 mr-4 text-primary" />
                  <CardTitle>Pay Pool Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage pool payments and entry fees</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Pool Members</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href={`/dashboard/pools/nfl-draft/${league.id}/commish/members`} passHref>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <Users className="w-6 h-6 mr-4 text-primary" />
                  <CardTitle>Member Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and manage pool members</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/dashboard/pools/nfl-draft/${league.id}/invite`} passHref>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <Mail className="w-6 h-6 mr-4 text-primary" />
                  <CardTitle>Invite Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Learn how to invite new members to your pool</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

