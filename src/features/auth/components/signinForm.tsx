"use client";
import Logo from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { handleError } from "@/lib/handleError";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GoogleIcon } from "./signupForm";
import Link from "next/link";

interface SignInFormProps {
  variant?: "page" | "modal";
}

const SignInForm = ({ variant = "page" }: SignInFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl");
  const authError = searchParams.get("error");
  console.log("callbackUrl", callbackUrl);

  const getErrorMessage = (errorCode: string | null) => {
    const errorMessages: Record<string, string> = {
      OAuthAccountNotLinked:
        "This email is already registered with email/password. Please sign in with your password instead.",
      Configuration:
        "This email is already registered. Please sign in instead.",
      AccessDenied: "Access denied. Please contact support.",
      OAuthSignin: "Error with Google sign-in. Please try again.",
      OAuthCallback: "Error completing Google sign-in. Please try again.",
      OAuthCreateAccount:
        "Could not create account with Google. Please try again.",
      Callback: "Error during sign-up. Please try again.",
      Default: "An error occurred during sign-up. Please try again.",
    };
    return errorCode ? errorMessages[errorCode] : errorMessages.Default;
  };

  // set error message from url search params on mount
  useEffect(() => {
    if (authError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(getErrorMessage(authError));
    }
  }, [authError]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate password length
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Extract the actual error message from the result
        // NextAuth sometimes wraps errors, so we need to parse them
        let errorMessage = result.error;

        // Check if it's a known error type and map to user-friendly message
        if (errorMessage === "CredentialsSignin") {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (errorMessage === "Configuration") {
          errorMessage =
            "This account was created with Google. Please use the Google sign-in option.";
        } else if (errorMessage.includes("CallbackRouteError")) {
          // Extract the actual error from callback errors
          errorMessage = "Authentication failed. Please try again.";
        } else if (errorMessage === "OAuthAccountNotLinked") {
          errorMessage =
            "This email is already registered with a different sign-in method. Please use that method to sign in.";
        }

        setError(errorMessage);
        setLoading(false);
        return;
      }

      router.push(callbackUrl || "/");
      router.refresh();
    } catch (error) {
      const errorMessages = handleError(
        error,
        "Failed to sign in. Please try again.",
      );
      setError(errorMessages);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignin = async () => {
    setLoading(true);
    setError("");

    try {
      await signIn("google", {
        callbackUrl: callbackUrl || "/",
      });
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex justify-center items-center",
        variant === "page"
          ? "h-screen bg-linear-to-br from-primary/5 to-primary/10 px-4 py-8"
          : "h-auto bg-background px-0 py-0",
      )}
    >
      <Card
        className={cn(
          "w-full max-w-md",
          variant === "page"
            ? "shadow-lg max-h-[95vh] overflow-y-auto"
            : "border-0 shadow-none",
        )}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <Logo />
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {registered && (
            <div className="bg-green-300 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm font-medium ">
              Account created successfully! Please sign in.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block  font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.currentTarget.value,
                  })
                }
                placeholder="mojahed@example.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-sm"
              />
            </div>
            <div>
              <label
                className="block font-medium text-gray-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.currentTarget.value,
                  })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-sm"
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>
            <Button
              disabled={loading}
              type="submit"
              className="w-full hover:bg-primary/90 text-primary-foreground font-medium text-xs active:scale-95 hover-effect"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGoogleSignin}
            disabled={loading}
            variant={"outline"}
            className="w-full border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium transition flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Sign In with Google
          </Button>
          <div className="mt-5 text-center text-sm text-gray-600">
            Don&apos;t have account?{" "}
            <Link
              href={"/auth/signup"}
              className="text-primary hover:text-primary/60 font-medium"
              scroll={false}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignInForm;
