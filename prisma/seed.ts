// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define color mapping for better naming
const COLOR_NAMES: Record<string, string> = {
  'beige': 'Beige',
  'charcoal': 'Charcoal', 
  'navy': 'Navy',
  'burgundy': 'Burgundy',
  'black': 'Black',
  'cream': 'Cream',
  'baby-pink': 'Blush Pink',
  'gray': 'Pearl Gray',
  'white': 'Pearl White',
}

// Define product configurations
const PRODUCT_CONFIGS: Record<string, { colors: string[], sizes: string[] }> = {
  'Beige Cashmere Sweater Men': {
    colors: ['beige', 'charcoal', 'navy', 'burgundy', 'black'],
    sizes: ['xs', 's', 'm', 'l', 'xl', 'xxl']
  },
  'Cashmere Sweater Women': {
    colors: ['cream', 'baby-pink', 'charcoal', 'navy'],
    sizes: ['xs', 's', 'm', 'l', 'xl']
  },
  // Add more products as you create them
}

async function main() {
  console.log('🌱 Starting seed: Creating product variants...\n')
  
  // Get all products that don't have variants yet
  const products = await prisma.product.findMany({
    where: {
      variants: {
        none: {}
      }
    }
  })

  if (products.length === 0) {
    console.log('✅ All products already have variants!')
    return
  }

  console.log(`📦 Found ${products.length} products without variants\n`)

  for (const product of products) {
    console.log(`🔄 Processing: ${product.name}`)
    
    // Get configuration for this product or use defaults
    const config = PRODUCT_CONFIGS[product.name] || {
      colors: product.availableColors.length > 0 ? product.availableColors : ['beige'],
      sizes: product.availableSizes.length > 0 ? product.availableSizes : ['m']
    }
    
    const colors = config.colors
    const sizes = config.sizes
    
    console.log(`   Colors: ${colors.join(', ')}`)
    console.log(`   Sizes: ${sizes.join(', ')}`)
    
    let variantCount = 0
    const totalVariants = colors.length * sizes.length
    const stockPerVariant = Math.max(1, Math.floor((product.stock || 50) / totalVariants))
    
    for (const color of colors) {
      for (const size of sizes) {
        // Generate a unique SKU
        const baseName = product.name.substring(0, 3).toUpperCase().replace(/\s/g, '')
        const sku = `${baseName}-${color.substring(0, 3)}-${size}-${Date.now()}`.toUpperCase()
        
        try {
          await prisma.productVariant.upsert({
            where: {
              productId_color_size: {
                productId: product.id,
                color: color,
                size: size.toLowerCase()
              }
            },
            update: {
              stock: stockPerVariant,
              isActive: true,
            },
            create: {
              productId: product.id,
              color: color,
              size: size.toLowerCase(),
              sku: sku,
              stock: stockPerVariant,
              isActive: true,
            }
          })
          variantCount++
        } catch (error) {
          console.error(`   ❌ Failed to create ${color}/${size}:`, error)
        }
      }
    }
    
    // Update product's available colors and sizes for frontend
    await prisma.product.update({
      where: { id: product.id },
      data: {
        availableColors: colors,
        availableSizes: sizes,
      }
    })
    
    console.log(`   ✅ Created ${variantCount} variants for ${product.name}\n`)
  }
  
  // Show summary
  const totalVariants = await prisma.productVariant.count()
  console.log(`🎉 Total variants in database: ${totalVariants}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })