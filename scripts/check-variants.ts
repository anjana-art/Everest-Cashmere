// scripts/check-variants.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVariants() {
  console.log('📊 Checking product variants...\n')
  
  const products = await prisma.product.findMany({
    include: {
      variants: {
        orderBy: [
          { color: 'asc' },
          { size: 'asc' }
        ]
      }
    }
  })
  
  let totalVariants = 0
  let productsWithVariants = 0
  let productsWithoutVariants = 0
  
  for (const product of products) {
    if (product.variants.length > 0) {
      productsWithVariants++
      totalVariants += product.variants.length
      
      console.log(`\n📦 ${product.name}`)
      console.log(`   Total variants: ${product.variants.length}`)
      console.log(`   Price: €${product.price}`)
      
      // Group by color
      const byColor = product.variants.reduce((acc, v) => {
        if (!acc[v.color]) {
          acc[v.color] = { sizes: [], totalStock: 0 }
        }
        acc[v.color].sizes.push(v.size.toUpperCase())
        acc[v.color].totalStock += v.stock
        return acc
      }, {} as Record<string, { sizes: string[], totalStock: number }>)
      
      console.log(`   Available Colors:`)
      for (const [color, data] of Object.entries(byColor)) {
        const colorName = color.charAt(0).toUpperCase() + color.slice(1)
        console.log(`     • ${colorName}: ${data.sizes.join(', ')} (Stock: ${data.totalStock})`)
      }
      
      // Show low stock warning
      const lowStock = product.variants.filter(v => v.stock > 0 && v.stock < 5)
      if (lowStock.length > 0) {
        console.log(`   ⚠️  Low stock warning: ${lowStock.length} variants have less than 5 items`)
      }
      
      const outOfStock = product.variants.filter(v => v.stock === 0)
      if (outOfStock.length > 0) {
        console.log(`   ❌ Out of stock: ${outOfStock.length} variants`)
      }
      
    } else {
      productsWithoutVariants++
      console.log(`\n⚠️  ${product.name} - No variants found!`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 SUMMARY:')
  console.log(`   Total Products: ${products.length}`)
  console.log(`   Products with variants: ${productsWithVariants}`)
  console.log(`   Products without variants: ${productsWithoutVariants}`)
  console.log(`   Total variants: ${totalVariants}`)
  console.log('='.repeat(50))
}

checkVariants()
  .catch(console.error)
  .finally(() => prisma.$disconnect())