import AuthModal from "@/features/auth/components/authModal";
import SignInForm from "@/features/auth/components/signinForm";
import { Suspense } from "react";
import { Fallback } from "../_components/authSkeleton";
import { RouteTransition } from "@/components/common/route-transition";

function SignInPage() {
  return (
    <RouteTransition className="animate-modal-enter">
      <AuthModal>
        <Suspense fallback={<Fallback />}>
          <SignInForm variant="modal" />
        </Suspense>
      </AuthModal>
    </RouteTransition>
  );
}

export default SignInPage;
