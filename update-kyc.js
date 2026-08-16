const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.partnerProfile.update({
    where: { id: 1 },
    data: {
      upiId: 'demo@upi',
      bankAccountNo: '1234567890',
      bankName: 'State Bank of India',
      bankIfsc: 'SBIN0001234',
      panNumber: 'ABCDE1234F',
      panImage: 'https://example.com/pan.jpg',
      aadhaarNumber: '123456789012',
      aadhaarFrontImage: 'https://example.com/aadhaar-front.jpg',
      aadhaarBackImage: 'https://example.com/aadhaar-back.jpg',
      kycVerifiedAt: new Date(),
    }
  });
  console.log('Updated partner 1');
}
run();
