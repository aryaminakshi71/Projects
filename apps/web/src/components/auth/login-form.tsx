/**
 * Login Form Component
 *
 * Email/password login with OAuth provider options.
 */

import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "@projects/auth/client";
import { GoogleIcon, GitHubIcon } from "./social-icons";

interface LoginFormProps extends React.ComponentProps<"form"> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password");
      } else {
        // Clear demo mode flags on successful login
        if (typeof window !== "undefined") {
          localStorage.removeItem("demo_mode");
          localStorage.removeItem("isDemo");
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("companyId");
        }
        toast.success("Welcome back!");
        navigate({ to: "/app", search: {} });
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/app`,
      });
    } catch {
      toast.error("Failed to login with Google");
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/app`,
      });
    } catch {
      toast.error("Failed to login with GitHub");
      setIsGitHubLoading(false);
    }
  };

  const isDisabled = isLoading || isGoogleLoading || isGitHubLoading;

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email field */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isDisabled}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password field */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            disabled={isDisabled}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* OAuth buttons */}
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isDisabled}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 size-4" />
          )}
          {isGoogleLoading ? "Connecting..." : "Login with Google"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleGitHubLogin}
          disabled={isDisabled}
        >
          {isGitHubLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <GitHubIcon className="mr-2 size-4" />
          )}
          {isGitHubLoading ? "Connecting..." : "Login with GitHub"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-primary underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
