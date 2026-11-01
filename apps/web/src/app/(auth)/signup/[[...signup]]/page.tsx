import AuthShell from "@/components/auth/AuthShell";
import SignUpComponent from "@/components/SignUp";

export default function Page() {
  return (
    <AuthShell>
      <SignUpComponent />
    </AuthShell>
  );
}
