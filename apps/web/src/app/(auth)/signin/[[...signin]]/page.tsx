import AuthShell from "@/components/auth/AuthShell";
import SignInComponent from "@/components/SignIn";

export default function Page() {
  return (
    <AuthShell>
      <SignInComponent />
    </AuthShell>
  );
}
