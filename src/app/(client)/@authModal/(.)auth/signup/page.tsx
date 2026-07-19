import AuthModal from "@/features/auth/components/authModal";
import SignUpForm from "@/features/auth/components/signupForm";
import { Suspense } from "react";
import { Fallback } from "../_components/authSkeleton";

function SignUpPage() {
  return (
    <AuthModal>
      <Suspense fallback={<Fallback />}>
        <SignUpForm variant="modal" />
      </Suspense>
    </AuthModal>
  );
}

export default SignUpPage;
