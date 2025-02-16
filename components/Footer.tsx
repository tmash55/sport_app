import Link from "next/link"
import { Twitter, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import config from "@/config";


export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                dryft
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Join the next generation of  sports pools and contests. Experience the thrill of live drafting and competitive
              gameplay.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild className="hover:text-primary">
                <Link href="https://twitter.com/dryft" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-2 lg:col-span-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/pools/start" className="text-muted-foreground hover:text-primary transition-colors">
                    Pools
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/tos" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} dryft. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="mailto:contact@dryft.com" className="flex items-center hover:text-primary transition-colors">
              <Mail className="h-4 w-4 mr-2" />
              {config.resend.supportEmail}
            </Link>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              USA
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

