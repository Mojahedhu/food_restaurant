import AuthModal from "@/features/auth/components/authModal";
import SignInForm from "@/features/auth/components/signinForm";
import { Suspense, ViewTransition } from "react";
import { Fallback } from "../_components/authSkeleton";

function SignInPage() {
  return (
    <ViewTransition name="auth-modal">
      <AuthModal>
        <Suspense fallback={<Fallback />}>
          <SignInForm variant="modal" />
        </Suspense>
      </AuthModal>
    </ViewTransition>
  );
}

export default SignInPage;
