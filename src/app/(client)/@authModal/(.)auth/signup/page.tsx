import AuthModal from "@/features/auth/components/authModal";
import SignUpForm from "@/features/auth/components/signupForm";
import { Suspense, ViewTransition } from "react";
import { Fallback } from "../_components/authSkeleton";

function SignUpPage() {
  return (
    <ViewTransition name="animate-modal-enter">
      <AuthModal>
        <Suspense fallback={<Fallback />}>
          <SignUpForm variant="modal" />
        </Suspense>
      </AuthModal>
    </ViewTransition>
  );
}

export default SignUpPage;
