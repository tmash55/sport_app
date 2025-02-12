"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Menu,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  PlusCircle,
  BookOpen,
  ClubIcon as Football,
  MoreHorizontal,
  HelpCircle,
  Newspaper,
  Home,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { AuthButtons } from "@/components/AuthButtons"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { ThemeSwitchingLogo } from "./ui/ThemeSwitchingLogo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const menuItems = [
  {
    name: "Start a Pool",
    href: "/pools/start",
    isButton: true,
    icon: PlusCircle,
  },
  {
    name: "How to Play",
    icon: PlayCircle,
    dropdown: [
      {
        name: "NCAAB March Madness Draft",
        href: "/how-to-play/march-madness-draft",
        icon: BookOpen,
      },
      {
        name: "NFL Draft",
        href: "/how-to-play/nfl-draft",
        icon: Football,
      },
    ],
  },
  {
    name: "More",
    icon: MoreHorizontal,
    dropdown: [
      {
        name: "Blog",
        href: "/blog",
        icon: Newspaper,
      },
      {
        name: "Support",
        href: "/support",
        icon: HelpCircle,
      },
    ],
  },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:justify-center relative">
          <Link href="/" className="flex items-center gap-2 absolute left-4">
            <ThemeSwitchingLogo />
            <span className="text-2xl font-bold dark:text-foreground text-[#11274F]">dryft</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {menuItems.map((item) =>
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.dropdown.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link href={subItem.href} className="w-full">
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : item.isButton ? (
                <Button key={item.name} asChild variant="default" size="sm">
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 absolute right-4">
            <div className="hidden sm:flex sm:items-center sm:gap-4">
              <ThemeToggle />
              <AuthButtons />
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 p-0">
                <SheetHeader className="p-6 text-left border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="px-6 py-4">
                  <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent mb-4">
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <nav className="space-y-2">
                    {menuItems.map((item) =>
                      item.dropdown ? (
                        <div key={item.name} className="space-y-2">
                          <button
                            onClick={() => setOpenSection(openSection === item.name ? null : item.name)}
                            className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent"
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight
                              className={cn("h-5 w-5 transition-transform", openSection === item.name && "rotate-90")}
                            />
                          </button>
                          {openSection === item.name && (
                            <div className="pl-4 space-y-1">
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md",
                            item.isButton
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "hover:bg-accent",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      ),
                    )}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t">
                  <div className="p-6 flex flex-col gap-4">
                    <ThemeToggle />
                    <AuthButtons />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

