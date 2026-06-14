"use client";
import Logo from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { handleError } from "@/lib/handleError";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export const GoogleIcon = () => {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 48 48"
      aria-label="Google icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083h-1.611V20H24v8h11.303C33.659 32.657 29.221 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.061 0 5.844 1.154 7.965 3.035l5.657-5.657C34.152 6.053 29.368 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.061 0 5.844 1.154 7.965 3.035l5.657-5.657C34.152 6.053 29.368 4 24 4c-7.732 0-14.41 4.388-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.153 0 9.86-1.977 13.409-5.197l-6.192-5.238C29.198 35.091 26.715 36 24 36c-5.201 0-9.629-3.328-11.286-7.946l-6.523 5.026C9.44 39.556 16.159 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083h-1.611V20H24v8h11.303c-1.09 3.028-3.148 5.492-5.878 7.074l6.192 5.238C39.984 36.105 44 30.576 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
};
interface SignUpFormProps {
  variant?: "page" | "modal";
}

const SignUpForm = ({ variant = "page" }: SignUpFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const authError = searchParams.get("error");

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
      // Validation password match
      if (formData.password !== formData.confirmPassword) {
        setError("Password do not match");
        return;
      }

      // Validate password length
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Map API error to use
        let errorMsg = data.error || "Failed to create account.";

        if (errorMsg === "User with this email already exists") {
          errorMsg =
            "This email is already registered. Please sign in instead or use a different email.";
        } else if (errorMsg === "All fields are required") {
          errorMsg = "Please fill in all fields.";
        } else if (errorMsg === "Password must be at least 8 characters") {
          errorMsg = "Password must be at least 8 characters long.";
        }

        throw new Error(errorMsg);
      }

      // redirect to sign-in page on success
      router.push("/auth/signin?registered=true", { scroll: false });
    } catch (error) {
      const errorMessages = handleError(
        error,
        "Failed to create account. Please try again.",
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
        callbackUrl: "/",
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
              Create Account
            </h1>
            <p className="text-sm text-gray-600">Signup to get started</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="block  font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.currentTarget.value,
                  })
                }
                placeholder="Mojahed Mohammed"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-sm"
              />
            </div>
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
            <div>
              <label
                className="block font-medium text-gray-700 mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.currentTarget.value,
                  })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-sm"
              />
            </div>
            <Button
              disabled={loading}
              type="submit"
              className="w-full hover:bg-primary/90 text-primary-foreground font-medium text-xs active:scale-95 hover-effect"
            >
              {loading ? "Creating Account..." : "Sign Up"}
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
            Sign up with Google
          </Button>
          <div className="mt-5 text-center text-sm text-gray-600">
            Do you have account?{" "}
            <Link
              href={"/auth/signin"}
              className="text-primary hover:text-primary/60 font-medium"
              scroll={false}
            >
              Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUpForm;
