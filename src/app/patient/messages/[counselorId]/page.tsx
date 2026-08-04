import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Thread } from "@/components/messages/thread";

export default async function PatientMessageThreadPage({
  params,
}: {
  params: Promise<{ counselorId: string }>;
}) {
  const { counselorId } = await params;
  const user = await requireRole("PATIENT");

  const relationship = await prisma.appointment.findFirst({
    where: { patientId: user.id, counselorId },
    include: { counselor: true },
  });
  if (!relationship) notFound();

  return (
    <Thread
      currentUserId={user.id}
      partnerId={counselorId}
      partnerName={relationship.counselor.fullName}
      backTo={`/patient/messages/${counselorId}`}
    />
  );
}
