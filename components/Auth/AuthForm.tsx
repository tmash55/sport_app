"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";

type AuthFormProps = {
  type: "signin" | "signup";
  onSuccess: (userId: string) => void;
};

export default function AuthForm({ type, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      if (type === "signup") {
        // ✅ Check if the username is already taken
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("display_name", username)
          .single();
  
        if (existingUser) {
          setError("This username is already taken. Please choose another.");
          setIsLoading(false);
          return;
        }
  
        // ✅ Proceed with signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: username } }, // ✅ Store username as full_name
        });
  
        if (error) {
          throw error;
        }
        if (!data.user) {
          throw new Error("An error occurred while creating your account. Please try again.");
        }
  
        toast.success("Signed up successfully!");
        onSuccess(data.user.id);
      } else {
        // ✅ Handle sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        onSuccess(data.user.id);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // ✅ Handle specific username error message
      if (error.message.includes("Database error saving new user")) {
        setError("This username is already taken.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleOAuthSignIn = async (provider: Provider) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("OAuth sign-in error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{type === "signup" ? "Create an account" : "Sign in"}</CardTitle>
        <CardDescription>
          {type === "signup"
            ? `Enter your details below to create your account`
            : `Enter your email below to sign in to your account`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter a unique username (min 3 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : type === "signup" ? "Sign up" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
