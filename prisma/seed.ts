import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@mhcp.local" },
    update: {},
    create: {
      fullName: "Platform Admin",
      email: "admin@mhcp.local",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const counselorUser = await prisma.user.upsert({
    where: { email: "counselor@mhcp.local" },
    update: {},
    create: {
      fullName: "Dr. Sarah Chen",
      email: "counselor@mhcp.local",
      passwordHash,
      role: "COUNSELOR",
      emailVerified: new Date(),
      counselorProfile: {
        create: {
          qualification: "PhD in Clinical Psychology",
          specialization: "Anxiety & Depression",
          experienceYears: 8,
          licenseNumber: "LIC-0001",
          bio: "Specializes in cognitive behavioral therapy for anxiety and mood disorders.",
          status: "APPROVED",
          availabilities: {
            create: [
              { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "12:00" },
              { dayOfWeek: "WEDNESDAY", startTime: "13:00", endTime: "17:00" },
              { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "12:00" },
            ],
          },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "patient@mhcp.local" },
    update: {},
    create: {
      fullName: "Jordan Patient",
      email: "patient@mhcp.local",
      passwordHash,
      role: "PATIENT",
      emailVerified: new Date(),
    },
  });

  console.log("Seeded users:");
  console.log("  admin@mhcp.local / Password123!");
  console.log("  counselor@mhcp.local / Password123! (approved:", counselorUser.id, ")");
  console.log("  patient@mhcp.local / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
