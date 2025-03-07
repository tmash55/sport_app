"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/libs/supabase/client"
import { useNflDraft } from "@/app/context/NflDraftContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Crown,
  UserX,
  Mail,
  CalendarDays,
  User,
  RefreshCw,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { InviteMembers } from "../leagues/InviteMembers"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeagueMember {
  id: string
  user_id: string
  league_id: string
  role: string
  team_name: string
  joined_at: string
  users: {
    display_name: string
    email: string
    avatar_url: string | null
  }
  entries_count: number
}

interface RemoveMemberConfirmation {
  isOpen: boolean
  memberId: string
  memberName: string
  entriesCount: number
}

export function MemberManagement() {
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { league, isCommissioner, refetchData } = useNflDraft()
  const supabase = createClient()
  const { toast } = useToast()
  const [confirmRemove, setConfirmRemove] = useState<RemoveMemberConfirmation>({
    isOpen: false,
    memberId: "",
    memberName: "",
    entriesCount: 0,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  const fetchMembers = useCallback(async () => {
    if (!league?.id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch league members with user details
      const { data, error } = await supabase
        .from("league_members")
        .select(`
          id, 
          user_id, 
          league_id, 
          role, 
          team_name, 
          joined_at,
          users (
            display_name, 
            email,
            avatar_url
          )
        `)
        .eq("league_id", league.id)
        .order("joined_at", { ascending: true })

      if (error) throw error

      // For each member, count their entries
      const membersWithEntryCounts = await Promise.all(
        data.map(async (member) => {
          const { count, error: countError } = await supabase
            .from("roster_entries")
            .select("id", { count: "exact", head: true })
            .eq("league_member_id", member.id)

          if (countError) {
            console.error("Error counting entries:", countError)
            return {
              ...member,
              entries_count: 0,
              // Ensure users is treated as a single object, not an array
              users: Array.isArray(member.users) ? member.users[0] : member.users,
            }
          }

          return {
            ...member,
            entries_count: count || 0,
            // Ensure users is treated as a single object, not an array
            users: Array.isArray(member.users) ? member.users[0] : member.users,
          }
        }),
      )

      setMembers(membersWithEntryCounts as LeagueMember[])
      // Reset to first page when data changes
      setCurrentPage(1)
    } catch (err) {
      console.error("Error fetching members:", err)
      setError("Failed to load league members. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [league?.id, supabase])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members

    const query = searchQuery.toLowerCase().trim()
    return members.filter((member) => {
      const displayName = member.users?.display_name?.toLowerCase() || ""
      const teamName = member.team_name?.toLowerCase() || ""
      const email = member.users?.email?.toLowerCase() || ""

      return displayName.includes(query) || teamName.includes(query) || email.includes(query)
    })
  }, [members, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredMembers, currentPage, itemsPerPage])

  const openRemoveConfirmation = (memberId: string, memberName: string, entriesCount: number) => {
    if (!isCommissioner) {
      toast({
        title: "Permission Denied",
        description: "Only commissioners can remove members",
        variant: "destructive",
      })
      return
    }

    setConfirmRemove({
      isOpen: true,
      memberId,
      memberName,
      entriesCount,
    })
  }

  const handleRemoveMember = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      // Call the RPC function to remove the member and their entries
      const { data, error } = await supabase.rpc("remove_member_with_entries", {
        p_member_id: confirmRemove.memberId,
        p_commissioner_id: userData.user.id,
      })

      if (error) throw error

      if (!data.success) {
        toast({
          title: "Cannot Remove Member",
          description: data.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Member Removed",
        description: data.message,
      })

      // Refresh the member list
      fetchMembers()
      // Also refresh the league data in the context
      refetchData()
    } catch (err) {
      console.error("Error removing member:", err)
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Close the confirmation dialog
      setConfirmRemove((prev) => ({ ...prev, isOpen: false }))
    }
  }

  const handleSendInvite = async (email: string, memberName: string) => {
    toast({
      title: "Reminder Sent",
      description: `A reminder email has been sent to ${memberName}.`,
    })
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold tracking-tight">Member Management</CardTitle>
          <CardDescription>View and manage members in your pool</CardDescription>
        </CardHeader>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-bold tracking-tight">Member Management</CardTitle>
          <CardDescription>View and manage members in your pool</CardDescription>
        </CardHeader>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchMembers} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  const isPaid = league?.payment_status === "paid"

  // Create the confirmation dialog description
  const getConfirmationDescription = () => {
    const { memberName, entriesCount } = confirmRemove
    return (
      <div className="space-y-4">
        <p>
          Are you sure you want to remove <span className="font-medium">{memberName}</span> from the pool?
        </p>

        {entriesCount > 0 && (
          <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <div className="ml-2">
              <AlertTitle className="text-orange-800 dark:text-orange-300 text-sm">
                Warning: Entries Will Be Deleted
              </AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-400 text-xs">
                Removing this member will permanently delete their {entriesCount}{" "}
                {entriesCount === 1 ? "entry" : "entries"}.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {isPaid && (
          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="ml-2">
              <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm">No Refunds</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                Removing members after payment does not provide any refunds. The pool fee is a one-time payment.
              </AlertDescription>
            </div>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold tracking-tight">Member Management</CardTitle>
        <CardDescription>View and manage members in your pool</CardDescription>
      </CardHeader>

      {isPaid && (
        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Payment Notice</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            Removing members after payment does not provide any refunds. The pool fee is a one-time payment.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Members ({members.length})</CardTitle>
          <CardDescription>
            {league?.league_settings?.[0]?.max_teams
              ? `${members.length} of ${league.league_settings[0].max_teams} spots filled`
              : `${members.length} members in this pool`}
          </CardDescription>

          {/* Search Bar */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <div className="w-full min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] min-w-[200px]">Member</TableHead>
                    <TableHead className="w-[15%] min-w-[100px]">Role</TableHead>
                    <TableHead className="w-[20%] min-w-[120px]">Joined</TableHead>
                    <TableHead className="w-[10%] min-w-[80px]">Entries</TableHead>
                    <TableHead className="w-[15%] min-w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              {member.users?.avatar_url ? (
                                <img
                                  src={member.users.avatar_url || "/placeholder.svg"}
                                  alt={member.users.display_name || "User"}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {member.users?.display_name || member.team_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">{member.users?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.role === "commissioner" ? (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 whitespace-nowrap">
                              <Crown className="h-3 w-3 mr-1" /> Commissioner
                            </Badge>
                          ) : (
                            <Badge variant="outline">Member</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                            {format(new Date(member.joined_at), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.entries_count}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleSendInvite(member.users?.email, member.users?.display_name || member.team_name)
                              }
                              title="Send reminder email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            {member.role !== "commissioner" && isCommissioner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  openRemoveConfirmation(
                                    member.id,
                                    member.users?.display_name || member.team_name,
                                    member.entries_count,
                                  )
                                }
                                title="Remove member"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? (
                          <div className="flex flex-col items-center gap-2">
                            <p>No members found matching "{searchQuery}"</p>
                            <Button variant="outline" size="sm" onClick={clearSearch}>
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          "No members found"
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>

        {/* Pagination Controls */}
        {filteredMembers.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
              <span className="text-center sm:text-left whitespace-nowrap">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMembers.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>Show</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 25, 50].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageToShow = i + 1
                  if (totalPages > 5 && currentPage > 3) {
                    pageToShow = currentPage - 2 + i
                  }
                  if (pageToShow > totalPages) return null

                  return (
                    <Button
                      key={pageToShow}
                      variant={currentPage === pageToShow ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 hidden sm:inline-flex"
                      onClick={() => handlePageChange(pageToShow)}
                    >
                      {pageToShow}
                    </Button>
                  )
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="mx-1 hidden sm:inline-flex">...</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hidden sm:inline-flex"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <span className="text-sm text-muted-foreground sm:hidden">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite New Members</CardTitle>
          <CardDescription>Share the link below to invite friends to your pool</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMembers leagueId={league.id} />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmRemove.isOpen}
        onOpenChange={(open) => setConfirmRemove((prev) => ({ ...prev, isOpen: open }))}
        title={`Remove ${confirmRemove.memberName}`}
        description={getConfirmationDescription()}
        cancelText="Cancel"
        confirmText="Remove Member"
        onConfirm={handleRemoveMember}
        variant="destructive"
      />
    </div>
  )
}

