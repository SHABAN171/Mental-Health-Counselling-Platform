import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BookAppointmentPage() {
  const counselors = await prisma.user.findMany({
    where: { role: "COUNSELOR", counselorProfile: { approved: true } },
    include: { counselorProfile: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Find a counselor</h1>
      {counselors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No counselors are available right now. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counselors.map((counselor) => (
            <Card key={counselor.id}>
              <CardHeader>
                <CardTitle>{counselor.fullName}</CardTitle>
                <CardDescription>{counselor.counselorProfile?.specialization}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>{counselor.counselorProfile?.qualification}</p>
                <p>{counselor.counselorProfile?.experienceYears} years of experience</p>
                {counselor.counselorProfile?.bio && <p className="mt-2">{counselor.counselorProfile.bio}</p>}
              </CardContent>
              <CardFooter>
                <Button
                  nativeButton={false}
                  render={<Link href={`/patient/book/${counselor.id}`}>Book a session</Link>}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
