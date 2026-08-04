import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Missing reset token. Use the link from your password reset email.</AlertDescription>
      </Alert>
    );
  }

  return <ResetPasswordForm token={token} />;
}
