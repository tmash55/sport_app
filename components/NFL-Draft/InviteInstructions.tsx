"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { InviteMembers } from "../leagues/InviteMembers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Mail, MessageSquare, Smartphone, Users, CheckCircle2, UserPlus, LinkIcon } from "lucide-react"

interface InviteInstructionsProps {
  leagueId: string
  leagueName?: string
}

export function InviteInstructions({ leagueId, leagueName = "your pool" }: InviteInstructionsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Invite Friends to {leagueName}</h2>
        <p className="text-muted-foreground">
          Share your unique invite link with friends to join your March Madness pool!
        </p>
      </div>

      {/* Make the invite section span full width by removing padding from parent and adding it to inner content */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2 mt-1 flex-shrink-0 hidden md:block">
              <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Your Invite Link</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                Copy this link and share it with friends to join your pool
              </p>

              <div className="w-full">
                <InviteMembers leagueId={leagueId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="howto">How It Works</TabsTrigger>
          <TabsTrigger value="tips">Pro Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-2 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Quick & Easy</h3>
                  <p className="text-sm text-muted-foreground">
                    When friends click your link, they&apos;ll create an account (or sign in) and automatically join your
                    pool!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-2 flex-shrink-0">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium">Track Invites</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll see members appear in your pool as they join. No manual approval needed!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-2 flex-shrink-0">
                  <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Unlimited Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your link as many times as needed until your pool is full.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900">
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              <span className="font-medium">Need more members?</span> Check the Member Management tab to see who&apos;s
              joined so far.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="howto" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-6">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Copy Your Unique Link</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the &quot;Copy Link&quot; button above to copy your pool&apos;s invite link to your clipboard.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Share With Friends</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Paste the link in text messages, emails, or social media to invite friends to your pool.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <MessageSquare className="h-3 w-3" /> Text Message
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <Mail className="h-3 w-3" /> Email
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <LinkIcon className="h-3 w-3" /> Social Media
                      </div>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Friends Join Automatically</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      When friends click the link, they&apos;ll create an account (or sign in) and be added to your pool
                      instantly.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/40 rounded-full p-2 flex-shrink-0">
                    <Smartphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create a Group Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a group chat with all potential members and share the link there for easy access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-2 flex-shrink-0">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Send a Fun Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Create an email with tournament details, pool rules, and the invite link to get everyone excited.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-2 flex-shrink-0">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Set a Join Deadline</h3>
                    <p className="text-sm text-muted-foreground">
                      Let friends know they need to join by a specific date before the tournament starts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Send Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Follow up with anyone who hasn&apos;t joined a few days before your deadline.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

