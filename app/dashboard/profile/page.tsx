"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLeagues } from "@/app/context/LeaguesContext"

export default function ProfilePage() {
  const { userInfo } = useLeagues()

  if (!userInfo) {
    return null
  }

  const displayName = userInfo.display_name || userInfo.email?.split("@")[0] || "User"
  const userInitials = displayName
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your profile information and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userInfo.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="text-lg font-medium">{displayName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{userInfo.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

