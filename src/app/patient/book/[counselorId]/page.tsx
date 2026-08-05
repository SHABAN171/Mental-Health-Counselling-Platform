import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "./booking-form";

export default async function BookCounselorPage({
  params,
}: {
  params: Promise<{ counselorId: string }>;
}) {
  const { counselorId } = await params;

  const counselor = await prisma.user.findUnique({
    where: { id: counselorId, role: "COUNSELOR" },
    include: { counselorProfile: { include: { availabilities: true } } },
  });

  if (!counselor || counselor.counselorProfile?.status !== "APPROVED") {
    notFound();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Book with {counselor.fullName}</CardTitle>
        <CardDescription>{counselor.counselorProfile.specialization}</CardDescription>
      </CardHeader>
      <CardContent>
        <BookingForm counselorId={counselor.id} availabilities={counselor.counselorProfile.availabilities} />
      </CardContent>
    </Card>
  );
}
