"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, ChevronLeft, ChevronRight, Crown, User } from "lucide-react"

interface LeagueMember {
  id: string
  team_name: string
  role: string
  avatar_url?: string
  joined_at?: string
  users?: {
    display_name?: string
    email?: string
    avatar_url?: string
  }
}

interface MembersSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueMembers: LeagueMember[]
  onUpdate: (updatedData: { removedMemberId: string }) => Promise<void>
}

export function MembersSettings({ leagueId, isCommissioner, leagueMembers, onUpdate }: MembersSettingsProps) {
  const [members, setMembers] = useState<LeagueMember[]>(leagueMembers)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    setMembers(leagueMembers)
  }, [leagueMembers])

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Member Management</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Members ({members.length})</CardTitle>
          <CardDescription>Manage the members in your pool</CardDescription>

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
                    <TableHead className="w-[60%] min-w-[300px]">Member</TableHead>
                    <TableHead className="w-[40%] min-w-[150px]">Role</TableHead>
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? (
                          <div className="flex flex-col items-center gap-2">
                            <p>No members found matching &quot;{searchQuery}&quot;</p>
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
    </div>
  )
}

