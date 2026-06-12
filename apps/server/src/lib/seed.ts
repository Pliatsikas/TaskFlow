import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  // Demo user (recruiters can use this to log in without registering)
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@taskflow.dev" },
    update: {},
    create: { email: "demo@taskflow.dev", name: "Demo User", passwordHash },
  });

  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "seed-workspace-1" },
    update: {},
    create: {
      id: "seed-workspace-1",
      name: "Product Team",
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  // Board
  const board = await prisma.board.upsert({
    where: { id: "seed-board-1" },
    update: {},
    create: { id: "seed-board-1", title: "Sprint 1", workspaceId: workspace.id },
  });

  // Columns
  const columns = await Promise.all(
    ["Backlog", "In Progress", "Review", "Done"].map((title, position) =>
      prisma.column.create({ data: { title, boardId: board.id, position } })
    )
  );

  // Sample tasks
  const sampleTasks = [
    { title: "Set up authentication", columnId: columns[3].id, priority: "HIGH" as const, position: 0 },
    { title: "Design database schema", columnId: columns[3].id, priority: "HIGH" as const, position: 1 },
    { title: "Build REST API", columnId: columns[1].id, priority: "HIGH" as const, position: 0 },
    { title: "Implement drag & drop", columnId: columns[1].id, priority: "MEDIUM" as const, position: 1 },
    { title: "Add real-time updates", columnId: columns[2].id, priority: "HIGH" as const, position: 0 },
    { title: "Write unit tests", columnId: columns[0].id, priority: "MEDIUM" as const, position: 0 },
    { title: "Deploy to Railway", columnId: columns[0].id, priority: "LOW" as const, position: 1 },
  ];

  for (const task of sampleTasks) {
    await prisma.task.create({ data: { ...task, assigneeId: user.id } });
  }

  console.log("✅ Seed complete!");
  console.log("   Demo login: demo@taskflow.dev / demo1234");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
