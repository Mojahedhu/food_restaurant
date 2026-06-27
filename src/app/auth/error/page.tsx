"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/logo";
import { Suspense } from "react";

const SvgIcon = () => (
  <div className="mx-auto flex items-center justify-center">
    <svg
      className="h-6 w-6  text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
);

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration:
      "This account was created with Google. Please use the Google sign-in option.",
    AccessDenied: "You do not have permission to sign in.",
    Verification:
      "The verification token has expired or has already been used. Please request a new verification email.",
    CredentialsSignin: "Invalid email or password. Please try again.",
    OAuthAccountNotLinked:
      "This email is already registered with a different signin method. Please use that method to sign in.",
    "Missing credentials": "Please provide both email and password.",
    "No user found": "No account found with this email address.",
    "Invalid password": "The password you entered is incorrect.",
    "Please sign in with Google":
      "This account was created with Google. Please use the Google sign-in option.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 to-primary/10 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <Logo />
          </div>
          <div className="text-center mb-6">
            <SvgIcon />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Authentication Error
            </h1>
            <p className="text-sm text-gray-600">Something went wrong</p>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {errorMessage}
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.refresh()}
            >
              Try Again
            </Button>
            <Link href="/" className="block">
              <Button className="w-full">Go Home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
