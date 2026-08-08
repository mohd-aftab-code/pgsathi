const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const PLANS = {
  free:     { yearlyPrice: 0 },
  standard: { yearlyPrice: 14990 },
  pro:      { yearlyPrice: 21990 },
  growth:   { yearlyPrice: 39990 },
};

const CAPABILITIES = {
  free:     { csvExport: false, csvImport: false, adsFree: false, staff: false, leads: false, pgManager: false },
  standard: { csvExport: true,  csvImport: true,  adsFree: true,  staff: false, leads: true,  pgManager: true },
  pro:      { csvExport: true,  csvImport: true,  adsFree: true,  staff: true,  leads: true,  pgManager: true },
  growth:   { csvExport: true,  csvImport: true,  adsFree: true,  staff: true,  leads: true,  pgManager: true },
};

async function main() {
  for (const slug of Object.keys(PLANS)) {
    const p = PLANS[slug];
    const c = CAPABILITIES[slug];

    const existing = await db.plan.findUnique({ where: { slug } });
    if (existing) {
      await db.plan.update({
        where: { slug },
        data: {
          yearlyPrice: p.yearlyPrice,
          quarterlyPrice: null,
          halfYearlyPrice: null,
          features: JSON.stringify(c),
          partnerCommissionType: 'PERCENT',
          partnerCommissionValue: 10,
          partnerCommissionMonths: 1,
        }
      });
      console.log(`Updated cycles and capabilities for: ${slug}`);
    } else {
      console.log(`Plan ${slug} not found in DB! Please run update-plans.js first.`);
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());
