// test-lib-prisma.ts
import { prisma } from './lib/prisma'

async function main() {
  console.log('🔍 Testing lib/prisma.ts with Prisma 6.x...')
  
  try {
    // Test 1: Simple raw query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as postgres_version`
    console.log('✅ Database connected!')
    console.log('Current time:', result[0].current_time)
    console.log('PostgreSQL version:', result[0].postgres_version)
    
    // Test 2: Try to use your models (optional)
    // const users = await prisma.user.findMany()
    // console.log(`📊 Found ${users.length} users`)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Database connection failed. Check:')
      console.log('1. Is PostgreSQL running?')
      console.log('2. Check DATABASE_URL in .env.local')
      console.log('3. Run: `npx prisma db push` to create tables')
    }
  } finally {
    await prisma.$disconnect()
    console.log('\n✅ Test completed successfully!')
  }
}

main()