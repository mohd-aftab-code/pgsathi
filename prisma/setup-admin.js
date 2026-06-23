const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function main() {
  // 1. Create Admin user
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  const admin = await db.user.upsert({
    where: { email: 'admin@pgsathi.in' },
    update: { role: 'ADMIN', passwordHash },
    create: {
      name: 'Super Admin',
      email: 'admin@pgsathi.in',
      phone: '9999999999',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
    }
  });
  console.log('✅ Admin user ready:', admin.email);

  // 2. Activate all PENDING listings
  const updated = await db.listing.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'ACTIVE', isActive: true }
  });
  console.log(`✅ Activated ${updated.count} listing(s)`);

  // Show all listings
  const listings = await db.listing.findMany({ select: { id: true, title: true, slug: true, status: true } });
  console.log('\n📋 All Listings:');
  listings.forEach(l => console.log(`  - [${l.status}] ${l.title} → /pg/${l.slug}`));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
