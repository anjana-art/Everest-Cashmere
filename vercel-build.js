// vercel-build.js
const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process...');
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm -v').toString().trim());

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build the Next.js app
  console.log('🏗️  Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}