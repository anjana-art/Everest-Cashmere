import { PrismaClient, ClothingType } from '@prisma/client';

console.log('=== ClothingType enum from the generated client ===');
console.log(ClothingType);
console.log('');

const prisma = new PrismaClient();
try {
  const result = await prisma.$queryRaw`
    SELECT enumlabel
    FROM pg_enum
    WHERE enumtypid = 'public."ClothingType"'::regtype
    ORDER BY enumsortorder
  `;
  console.log('=== Enum in the DB the client connects to ===');
  console.log(result);
} catch (e) {
  console.error('=== DB query failed ===');
  console.error(e.message);
}
await prisma.$disconnect();
