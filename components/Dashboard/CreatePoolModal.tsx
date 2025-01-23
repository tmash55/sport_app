"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const sports = ["Basketball", "Football", "Baseball", "Golf", "Hockey"]

export function CreatePoolModal() {
  const [open, setOpen] = useState(false)
  const [selectedSport, setSelectedSport] = useState("")

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle pool creation logic here
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground">
          Create New Pool
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Pool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="poolName">Pool Name</Label>
            <Input id="poolName" placeholder="Enter pool name" required />
          </div>
          <div>
            <Label>Select Sport</Label>
            <RadioGroup value={selectedSport} onValueChange={setSelectedSport} className="flex flex-col space-y-1">
              {sports.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <RadioGroupItem value={sport} id={sport} />
                  <Label htmlFor={sport}>{sport}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">Create Pool</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

