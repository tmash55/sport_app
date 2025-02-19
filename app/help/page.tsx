import type { Metadata } from "next"

import FeedbackForm from "@/components/FeedbackForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"

export const metadata: Metadata = {
  title: "Help & Support | March Madness Fantasy",
  description:
    "Get help and support for March Madness Fantasy. Find answers to frequently asked questions or contact our support team.",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto py-12 px-4 ">
        <h1 className="text-4xl font-bold mb-8 text-center mt-16">Help & Support</h1>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you as soon as possible.
              </p>
              <FeedbackForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

