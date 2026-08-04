"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const [role, setRole] = useState<"PATIENT" | "COUNSELOR">("PATIENT");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Register as a patient looking for support, or a counselor offering it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          {state?.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Tabs value={role} onValueChange={(v) => setRole(v as "PATIENT" | "COUNSELOR")}>
            <TabsList className="w-full">
              <TabsTrigger value="PATIENT">Patient</TabsTrigger>
              <TabsTrigger value="COUNSELOR">Counselor</TabsTrigger>
            </TabsList>
          </Tabs>
          <input type="hidden" name="role" value={role} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
            {state?.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {role === "COUNSELOR" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" placeholder="e.g. PhD in Clinical Psychology" />
                {state?.errors?.qualification && (
                  <p className="text-sm text-destructive">{state.errors.qualification[0]}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" placeholder="e.g. Anxiety & Depression" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="licenseNumber">License number</Label>
                <Input id="licenseNumber" name="licenseNumber" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="experienceYears">Years of experience</Label>
                <Input id="experienceYears" name="experienceYears" type="number" min="0" defaultValue="0" />
              </div>
              <Alert>
                <AlertDescription>
                  Counselor accounts require admin approval before you can accept appointments.
                </AlertDescription>
              </Alert>
            </>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
