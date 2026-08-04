import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOOD_EMOJI, MOOD_LABEL, MOOD_SCORE } from "@/lib/mood";
import { MoodTrendChart } from "@/components/charts/mood-trend-chart";
import { MoodForm } from "./mood-form";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function MoodTrackerPage() {
  const user = await requireRole("PATIENT");

  const thirtyDaysAgo = new Date(startOfToday());
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const entries = await prisma.moodEntry.findMany({
    where: { userId: user.id, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const todaysEntry = entries.find((e) => e.date >= startOfToday()) ?? null;

  const chartData = entries.map((entry) => ({
    date: entry.date.toISOString(),
    score: MOOD_SCORE[entry.mood],
    moodLabel: MOOD_LABEL[entry.mood],
    note: entry.note,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodForm todaysMood={todaysEntry?.mood ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mood over the last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length < 2 ? (
            <p className="text-sm text-muted-foreground">Log a few more days to see your trend.</p>
          ) : (
            <MoodTrendChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...entries].reverse().map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {MOOD_EMOJI[entry.mood]} {MOOD_LABEL[entry.mood]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
