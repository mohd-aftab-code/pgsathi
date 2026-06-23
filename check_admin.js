const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.findUnique({where:{email:'admin@pgsathi.in'}}).then(console.log).finally(() => db.$disconnect());
