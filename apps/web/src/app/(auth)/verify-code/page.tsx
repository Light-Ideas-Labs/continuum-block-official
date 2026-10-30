import AuthShell from "@/components/auth/AuthShell";
import VerifyCodeForm from "@/components/auth/VerifyCodeForm";

export default function Page() {
  return (
    <AuthShell>
      <VerifyCodeForm />
    </AuthShell>
  );
}
