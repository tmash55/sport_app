"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, Users, Mail, ArrowLeft } from "lucide-react";
import { useNflDraft } from "@/app/context/NflDraftContext";
import { PoolSettingsForm } from "./PoolSettingsForm";
import { MemberManagement } from "./MemberManagement";
import { InviteInstructions } from "./InviteInstructions";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

type Section = "main" | "settings" | "payment" | "members" | "invite";

interface CommishHQDialogProps {
  children: React.ReactNode;
  initialSection?: Section;
  initialScrollSection?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommishHQDialog({
  children,
  initialSection,
  initialScrollSection,
  isOpen,
  onOpenChange,
}: CommishHQDialogProps) {
  const [activeSection, setActiveSection] = useState<Section>("main");
  const { league, updatePool } = useNflDraft();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // 🛠 Ensures the correct section is in view after rendering
  useEffect(() => {
    if (initialScrollSection && scrollContainerRef.current) {
      setTimeout(() => {
        const element = document.getElementById(initialScrollSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Delay scrolling to avoid layout shift issues
    }
  }, [activeSection, initialScrollSection]);

  const handleOpen = (section?: Section) => {
    setActiveSection(section || "main");
    onOpenChange(true);
  };

  const handleUpdate = async (updatedLeague: any) => {
    try {
      await updatePool(updatedLeague);
    } catch (error) {
      console.error("Error updating pool:", error);
    }
  };

  const handleBack = () => {
    setActiveSection("main");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "settings":
        return (
          <div id="poolSettingsForm">
            <PoolSettingsForm league={league} onUpdate={handleUpdate} />
          </div>
        );
      case "payment":
        return <h2 className="text-2xl font-semibold mb-4">Pay Pool Fee</h2>;
      case "members":
        return (
          <div id="memberManagement"><MemberManagement /></div>
          
        );
      case "invite":
        return (
          <InviteInstructions leagueId={league?.id} leagueName={league?.name} />
        );
      default:
        return (
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                General Pool Settings
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card
                  className="hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setActiveSection("settings")}
                >
                  <CardHeader className="flex flex-row items-center space-y-0">
                    <Settings className="w-6 h-6 mr-4 text-primary" />
                    <CardTitle>Pool Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Adjust general pool settings and preferences
                    </p>
                  </CardContent>
                </Card>
                <Card
                    className={cn(
                      "transition-colors",
                      league.payment_status === "paid" ? "opacity-90" : "hover:bg-accent cursor-pointer",
                    )}
                    onClick={() => {
                      if (league.payment_status !== "paid") {
                        setActiveSection("payment")
                      }
                    }}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0 justify-between">
                      <div className="flex flex-row items-center">
                        <DollarSign className="w-6 h-6 mr-4 text-primary" />
                        <CardTitle>Payment</CardTitle>
                      </div>
                      {league.payment_status && (
                        <Badge
                          variant={league.payment_status === "paid" ? "default" : "destructive"}
                          className={cn(
                            "px-3 py-1 text-xs font-medium",
                            league.payment_status === "paid"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600",
                          )}
                        >
                          {league.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {league.payment_status === "paid"
                          ? "Payment completed"
                          : "Manage pool payments and entry fees"}
                      </p>
                    </CardContent>
                  </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Pool Members</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card
                  className="hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setActiveSection("members")}
                >
                  <CardHeader className="flex flex-row items-center space-y-0">
                    <Users className="w-6 h-6 mr-4 text-primary" />
                    <CardTitle>Member Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and manage pool members
                    </p>
                  </CardContent>
                </Card>
                <Card
                  className="hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setActiveSection("invite")}
                >
                  <CardHeader className="flex flex-row items-center space-y-0">
                    <Mail className="w-6 h-6 mr-4 text-primary" />
                    <CardTitle>Invite Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn how to invite new members to your pool
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild onClick={() => handleOpen(initialSection)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-[98vw] h-[95vh] max-h-[800px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Commish HQ</DialogTitle>
        </DialogHeader>
        <ScrollArea
          ref={scrollContainerRef}
          className="h-[calc(95vh-120px)] sm:h-[calc(95vh-80px)] max-h-[720px]"
        >
          <div className="p-6">
            {activeSection !== "main" && (
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Commish HQ
              </Button>
            )}
            {renderContent()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
