import bcrypt from "bcryptjs";
import { PrismaClient, Role, SettingScope, IntegrationProvider } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cities = [
    { name: "Austin", slug: "austin", state: "TX", timezone: "America/Chicago" },
    { name: "Miami", slug: "miami", state: "FL", timezone: "America/New_York" },
    { name: "Denver", slug: "denver", state: "CO", timezone: "America/Denver" },
    { name: "Phoenix", slug: "phoenix", state: "AZ", timezone: "America/Phoenix" },
    { name: "Seattle", slug: "seattle", state: "WA", timezone: "America/Los_Angeles" }
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city
    });
  }

  const categories = [
    { name: "Local Politics", slug: "local-politics" },
    { name: "Business", slug: "business" },
    { name: "Crime & Safety", slug: "crime-safety" },
    { name: "Events", slug: "events" },
    { name: "Sports", slug: "sports" }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  const adminPassword = await bcrypt.hash("ChangeMe123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@alyson.ai" },
    update: { passwordHash: adminPassword, role: Role.ADMIN, isActive: true },
    create: { email: "admin@alyson.ai", passwordHash: adminPassword, role: Role.ADMIN }
  });

  const firstCity = await prisma.city.findFirstOrThrow({ where: { slug: "austin" } });
  const editorPassword = await bcrypt.hash("ChangeMe123!", 10);
  const reviewerPassword = await bcrypt.hash("ChangeMe123!", 10);

  await prisma.user.upsert({
    where: { email: "editor@alyson.ai" },
    update: { passwordHash: editorPassword, role: Role.EDITOR, cityId: firstCity.id },
    create: { email: "editor@alyson.ai", passwordHash: editorPassword, role: Role.EDITOR, cityId: firstCity.id }
  });

  await prisma.user.upsert({
    where: { email: "reviewer@alyson.ai" },
    update: { passwordHash: reviewerPassword, role: Role.REVIEWER, cityId: firstCity.id },
    create: { email: "reviewer@alyson.ai", passwordHash: reviewerPassword, role: Role.REVIEWER, cityId: firstCity.id }
  });

  const globalSettings = [
    { key: "moderationMode", value: false },
    { key: "autoPublishThreshold", value: 0.9 },
    { key: "reviewThreshold", value: 0.7 }
  ];

  for (const setting of globalSettings) {
    const existing = await prisma.setting.findFirst({ where: { cityId: null, key: setting.key } });
    if (existing) {
      await prisma.setting.update({
        where: { id: existing.id },
        data: { scope: SettingScope.GLOBAL, value: setting.value }
      });
    } else {
      await prisma.setting.create({
        data: { scope: SettingScope.GLOBAL, key: setting.key, value: setting.value }
      });
    }
  }

  const globalIntegrations: IntegrationProvider[] = [
    IntegrationProvider.OPENAI,
    IntegrationProvider.ANTHROPIC,
    IntegrationProvider.DEEPSEEK,
    IntegrationProvider.SALESFORCE,
    IntegrationProvider.GMASS
  ];

  for (const provider of globalIntegrations) {
    const existing = await prisma.integration.findFirst({
      where: { cityId: null, provider }
    });
    if (existing) {
      await prisma.integration.update({
        where: { id: existing.id },
        data: { isEnabled: true, encryptedApiKey: "" }
      });
    } else {
      await prisma.integration.create({ data: { provider, encryptedApiKey: "", isEnabled: true } });
    }
  }

  console.log(`Seed complete. Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
