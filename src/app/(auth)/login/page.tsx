import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      {params.registered && (
        <Alert>
          <AlertDescription>
            Account created. Check your email for a verification link before logging in.
          </AlertDescription>
        </Alert>
      )}
      {params.reset && (
        <Alert>
          <AlertDescription>Your password has been reset. Log in with your new password.</AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </div>
  );
}
