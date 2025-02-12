"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DraftSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialSettings: {
    leagueName: string
    minutesPerPick: number
  }
  onSettingsChange: (newSettings: { leagueName: string; minutesPerPick: number }) => void
}

const timerOptions = [
  { label: "1 minute", value: "60" },
  { label: "2 minutes", value: "120" },
  { label: "5 minutes", value: "300" },
  { label: "10 minutes", value: "600" },
  { label: "1 hour", value: "3600" },
  { label: "2 hours", value: "7200" },
  { label: "4 hours", value: "14400" },
  { label: "8 hours", value: "28800" },
  { label: "12 hours", value: "43200" },
  { label: "24 hours", value: "86400" },
  { label: "No Limit", value: "99999" },
]

export function DraftSettingsModal({ isOpen, onClose, initialSettings, onSettingsChange }: DraftSettingsModalProps) {
  const [leagueName, setLeagueName] = useState(initialSettings.leagueName)
  const [minutesPerPick, setMinutesPerPick] = useState(initialSettings.minutesPerPick.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSettingsChange({ leagueName, minutesPerPick: Number.parseInt(minutesPerPick) })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>General Draft Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leagueName" className="text-right">
                League Name
              </Label>
              <Input
                id="leagueName"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pick Timer</Label>
              <Select value={minutesPerPick} onValueChange={setMinutesPerPick}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pick timer duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Quick Picks</SelectLabel>
                    {timerOptions.slice(0, 4).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectLabel>Extended Time</SelectLabel>
                    {timerOptions.slice(4, -1).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectLabel>Special</SelectLabel>
                    <SelectItem value="99999">No Limit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

