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
  CardFooter,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { isUsernameAvailable, debounce } from "@/utils/auth";

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
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false)
  const supabase = createClient();

  

  const debouncedCheckUsername = React.useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        const available = await isUsernameAvailable(username);
        setIsUsernameValid(available);
      } else {
        setIsUsernameValid(null);
      }
    }, 500),
    []
  );

  

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (newUsername.length >= 3) {
      debouncedCheckUsername(newUsername);
    } else {
      setIsUsernameValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (type === "signup") {
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("display_name", username)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingUser) {
          throw new Error("Username is already taken");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const { error: updateError } = await supabase
            .from("users")
            .update({ display_name: username })
            .eq("id", data.user.id);

          if (updateError) throw updateError;

          toast.success("Signed up successfully!");
          onSuccess(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        onSuccess(data.user.id);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      })
      if (error) throw error
  
      if (data.url) {
        // Redirect the user to the OAuth provider's login page
        window.location.href = data.url
      } else {
        // This else block might not be necessary, but we'll keep it for now
        console.log("OAuth sign-in initiated, but no redirect URL was provided.")
      }
    } catch (error) {
      console.error("OAuth sign-in error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "signup" ? "Create an account" : "Sign in"}
        </CardTitle>
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
                onChange={handleUsernameChange}
                required
                minLength={3}
              />
              {username.length >= 3 && isUsernameValid === false && (
                <p className="text-sm text-red-500">Username is already taken</p>
              )}
              {username.length >= 3 && isUsernameValid === true && (
                <p className="text-sm text-green-500">Username is available</p>
              )}
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
            {isLoading
              ? "Loading..."
              : type === "signup"
              ? "Sign up"
              : "Sign in"}
          </Button>
        </form>
      </CardContent>
     
    </Card>
  );
}

