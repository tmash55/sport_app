import Link from "next/link"
import { Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import config from "@/config"

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              dryft
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} dryft. All rights reserved.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Button variant="ghost" size="icon" asChild className="hover:text-primary">
            <Link href="https://x.com/DryftSports" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:text-primary text-xs">
            <Link href="/help">Help</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:text-primary text-xs">
            <Link href="/privacy-policy">Privacy</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:text-primary text-xs">
            <Link href="/tos">Terms</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:text-primary text-xs">
            <Link href={`mailto:${config.resend.supportEmail}`}>
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}

