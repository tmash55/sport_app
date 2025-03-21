"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Report a Bug" },
]

export default function FeedbackForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [inquiryType, setInquiryType] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, inquiryType, message }),
      })

      if (!response.ok) {
        throw new Error("Failed to send feedback")
      }

      setSuccess(true)
      setName("")
      setEmail("")
      setInquiryType("")
      setMessage("")
    } catch (err) {
      setError("An error occurred while sending your feedback. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiryType">Type of Inquiry</Label>
        <Select value={inquiryType} onValueChange={setInquiryType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            {inquiryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="min-h-[150px]"
        />
      </div>
      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500/50 bg-green-50 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Thank you for your feedback!</AlertTitle>
          <AlertDescription className="mt-1">
            We appreciate you taking the time to share your thoughts with us. Our team will review your message and get
            back to you as soon as possible.
          </AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Feedback"
        )}
      </Button>
    </form>
  )
}

