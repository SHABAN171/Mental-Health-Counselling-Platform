import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Thread } from "@/components/messages/thread";

export default async function CounselorMessageThreadPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const user = await requireRole("COUNSELOR");

  const relationship = await prisma.appointment.findFirst({
    where: { counselorId: user.id, patientId },
    include: { patient: true },
  });
  if (!relationship) notFound();

  return (
    <Thread
      currentUserId={user.id}
      partnerId={patientId}
      partnerName={relationship.patient.fullName}
      backTo={`/counselor/messages/${patientId}`}
    />
  );
}
