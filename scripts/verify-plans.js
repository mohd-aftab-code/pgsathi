const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const plans = await db.plan.findMany({
    orderBy: { price: 'asc' }
  });
  
  console.log("=== VERIFYING PLANS IN DATABASE ===\n");
  for (const p of plans) {
    console.log(`Plan: ${p.name} (Slug: ${p.slug})`);
    console.log(`  Active: ${p.isActive}`);
    console.log(`  Monthly Price: ${p.price}`);
    console.log(`  Yearly Price: ${p.yearlyPrice}`);
    console.log(`  Quarterly/Half-Yearly: ${p.quarterlyPrice} / ${p.halfYearlyPrice}`);
    console.log(`  Limits -> PGs: ${p.maxListings}, Tenants: ${p.maxTenants}, Photos: ${p.maxPhotos}`);
    console.log(`  Features:`, p.features);
    console.log(`  Partner Commission: ${p.partnerCommissionValue} ${p.partnerCommissionType}`);
    console.log("--------------------------------------------------");
  }
}

main().catch(console.error).finally(() => db.$disconnect());
