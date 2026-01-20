/**
 * Signup Form Component
 *
 * Email/password registration with OAuth provider options.
 */

import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { authClient } from "@projects/auth/client";
import { GoogleIcon, GitHubIcon } from "./social-icons";

interface SignupFormProps extends React.ComponentProps<"form"> {}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
      } else {
        // Clear demo mode flags on successful signup
        if (typeof window !== "undefined") {
          localStorage.removeItem("demo_mode");
          localStorage.removeItem("isDemo");
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("companyId");
        }
        toast.success("Account created successfully!");
        navigate({ to: "/app", search: {} });
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/app`,
      });
    } catch {
      toast.error("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsGitHubLoading(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/app`,
      });
    } catch {
      toast.error("Failed to sign up with GitHub");
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
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Start your free trial today
        </p>
      </div>

      <div className="grid gap-6">
        {/* Name field */}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={isDisabled}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            disabled={isDisabled}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked: boolean | "indeterminate") => setAcceptTerms(checked === true)}
            disabled={isDisabled}
          />
          <label
            htmlFor="terms"
            className="text-sm leading-tight text-muted-foreground"
          >
            I agree to the{" "}
            <Link to="/terms" className="text-primary underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
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
          onClick={handleGoogleSignup}
          disabled={isDisabled}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 size-4" />
          )}
          {isGoogleLoading ? "Connecting..." : "Sign up with Google"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleGitHubSignup}
          disabled={isDisabled}
        >
          {isGitHubLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <GitHubIcon className="mr-2 size-4" />
          )}
          {isGitHubLoading ? "Connecting..." : "Sign up with GitHub"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
