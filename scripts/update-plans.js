const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const PLANS = {
  free:     { name: "Starter",    price: 0,    duration: "30 Days" },
  standard: { name: "Standard",   price: 1499, duration: "1 Month" },
  pro:      { name: "Pro",        price: 2199, duration: "1 Month" },
  growth:   { name: "Growth",     price: 3999, duration: "1 Month" },
};

const PLAN_LIMITS = {
  free:     { maxListings: 1,  maxPhotos: 5,  maxTenants: 5 },
  standard: { maxListings: 1,  maxPhotos: 15, maxTenants: 50 },
  pro:      { maxListings: 3,  maxPhotos: 30, maxTenants: 150 },
  growth:   { maxListings: -1, maxPhotos: 99, maxTenants: -1 },
};

async function main() {
  for (const slug of Object.keys(PLANS)) {
    const p = PLANS[slug];
    const limits = PLAN_LIMITS[slug];

    const capabilities = {
      maxListings: limits.maxListings,
      maxPhotos: limits.maxPhotos,
      maxTenants: limits.maxTenants,
      maxManagers: slug === 'free' ? 0 : slug === 'standard' ? 1 : slug === 'pro' ? 3 : -1,
    };

    const existing = await db.plan.findUnique({ where: { slug } });
    if (existing) {
      await db.plan.update({
        where: { slug },
        data: {
          name: p.name,
          price: p.price,
          maxListings: limits.maxListings,
          maxPhotos: limits.maxPhotos,
          maxTenants: limits.maxTenants,
          isActive: true
        }
      });
      console.log(`Updated plan: ${slug}`);
    } else {
      await db.plan.create({
        data: {
          slug: slug,
          name: p.name,
          price: p.price,
          maxListings: limits.maxListings,
          maxPhotos: limits.maxPhotos,
          maxTenants: limits.maxTenants,
          isActive: true,
          partnerCommissionType: 'PERCENT',
          partnerCommissionValue: 10,
          partnerCommissionMonths: 1,
          referralBonusDays: 0,
          features: '[]'
        }
      });
      console.log(`Created plan: ${slug}`);
    }
  }

  // Deactivate old plans
  const oldPlans = ['basic', 'scale', 'enterprise'];
  for (const slug of oldPlans) {
    const existing = await db.plan.findUnique({ where: { slug } });
    if (existing) {
      await db.plan.update({
        where: { slug },
        data: { isActive: false }
      });
      console.log(`Deactivated legacy plan: ${slug}`);
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());
