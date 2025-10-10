import { faker } from '@faker-js/faker'
import { env } from '../envConfig.js'
import { prisma } from '../lib/prisma.js'

// Verify env is loaded
console.log('Database URL exists:', !!env.DATABASE_URL)

const creatorId = 'D6o7bZwXeQbrtNfDQIgTIeJv6v02'
export async function getBlurDataUrl(imageUrl: string) {
  try {
    const res = await fetch(imageUrl)

    // Check if response is ok and has content
    if (!res.ok) {
      console.warn(`Failed to fetch image from ${imageUrl}, using fallback`)
      return getFallbackBlurDataUrl()
    }

    const buffer = await res.arrayBuffer()

    // Check if buffer is empty
    if (buffer.byteLength === 0) {
      console.warn(`Empty buffer from ${imageUrl}, using fallback`)
      return getFallbackBlurDataUrl()
    }

    const { getPlaiceholder } = await import('plaiceholder')
    const { base64 } = await getPlaiceholder(Buffer.from(buffer))

    return base64
  } catch (err) {
    console.error('Error generating blur placeholder:', err)
    return getFallbackBlurDataUrl()
  }
}

function getFallbackBlurDataUrl(): string {
  // Return a simple gray placeholder blur data URL
  // This is a base64 encoded 1x1 gray pixel
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDE='
}

/**
 * Main entry point for seeding the database with sample data.
 *
 * 1. Connects to the database using {@link connectToDB}.
 * 2. Runs the type-safe seeding function using {@link seedDatabase}.
 * 3. Closes the database connection and exits the process with a status code
 *    depending on whether the seeding was successful or not.
 *
 * @throws {Error} If the seeding fails, an error is thrown with a message
 * describing the failure.
 */
async function runSeed() {
  try {
    console.log('Starting database seeding...')

    // Run seed function
    await seedDatabase()

    console.log('Seeding completed successfully.')

    // Close the connection
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

function randomArrayElements<T>(array: T[], options?: { min?: number; max?: number }): T[] {
  const min = options?.min ?? 1
  const max = options?.max ?? array.length
  const count = faker.number.int({ min, max })
  return faker.helpers.arrayElements(array, count)
}

// Type-safe seeding function with comprehensive error handling
async function seedDatabase() {
  try {
    // Clear existing data with type-safe delete operations
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.wishlist.deleteMany()

    // Delete junction tables first
    await prisma.categoriesOnProducts.deleteMany()
    await prisma.userMerchantManager.deleteMany()
    await prisma.categoryOnMerchant.deleteMany()

    // Handle self-referential relationship in Category
    // First set all parentId to null
    await prisma.category.updateMany({
      data: {},
    })
    // Then delete all categories
    await prisma.category.deleteMany()

    // Delete dependent records first (products reference media)
    await prisma.product.deleteMany()

    // Delete main tables
    await prisma.media.deleteMany()
    await prisma.user.deleteMany()
    await prisma.merchant.deleteMany()
    await prisma.wallet.deleteMany()

    const unsplashImages = [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    ];

    // Seed Media first with real Unsplash images
    const mediaRecords = await Promise.all(
      Array(30)
        .fill(null)
        .map(async (_, index) => {
          const imageUrl = unsplashImages[index % unsplashImages.length];

          return prisma.media.create({
            data: {
              fileName: `image_${index + 1}.jpg`,
              creatorId: creatorId,
              url: imageUrl,
              blurDataUrl: await getBlurDataUrl(imageUrl),
            },
          })
        }),
    )

    // Seed Users first
    const userRecords = await Promise.all(
      Array(5)
        .fill(null)
        .map(() =>
          prisma.user.create({
            data: {
              authId: faker.string.alphanumeric(28).toLowerCase(),
              email: faker.internet.email(),
              fullName: faker.person.fullName(),
              phone: faker.phone.number(),
              roles: faker.helpers.arrayElements(['customer', 'merchant', 'driver'] as const, {
                min: 1,
                max: 2
              }),
              cni: Math.random() > 0.7 ? faker.string.alphanumeric(10) : null,
              driverDocument: Math.random() > 0.8 ? faker.string.alphanumeric(10) : null,
            },
          }),
        ),
    )

    const categoryNames = [
      'Produce',
      'Meat & Seafood',
      'Deli',
      'Bakery',
      'Frozen',
      'Dairy & Eggs',
      'Pantry',
      'Beverages',
      'Health & Beauty',
      'Household',
      'Pet Care',
      'Baby',
    ]
    const categoryRecords: Array<{ id: string; name: string; slug: string }> = []

    // Seed Categories with sequential creation and proper image relationships

    for (let i = 0; i < categoryNames.length; i++) {
      // Create a dedicated media record for each category
      let categoryImageId = null
      if (mediaRecords.length > 0) {
        const imageIndex = i % mediaRecords.length
        categoryImageId = mediaRecords[imageIndex].id
      }

      const category = await prisma.category.create({
        data: {
          name: categoryNames[i],
          slug: categoryNames[i].toLowerCase().replace(/\s+/g, '-'),
          description: faker.commerce.productDescription(),
          ...(categoryImageId
            ? {
              imageId: categoryImageId,
            }
            : {}),
          seoMetadata: {
            seoTitle: faker.lorem.words(3),
            seoDescription: faker.lorem.sentence(),
            keywords: faker.lorem.words(5).split(' '),
          },
        },
      })
      categoryRecords.push(category)
    }
    const merchantCategories = randomArrayElements(categoryRecords, { min: 1, max: 2 })
    // Seed Merchants with specific types for Instacart-style stores
    const merchantData = [
      {
        name: "Whole Foods Market",
        type: "GROCERY",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop",
        deliveryTime: "By 10:30am",
        rating: 4.5,
      },
      {
        name: "Costco",
        type: "GROCERY",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop",
        deliveryTime: "By 11:00am",
        rating: 4.3,
      },
      {
        name: "CVS Pharmacy",
        type: "PHARMACY",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=300&fit=crop",
        deliveryTime: "By 2:00pm",
        rating: 4.2,
      },
      {
        name: "Walgreens",
        type: "PHARMACY",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=300&fit=crop",
        deliveryTime: "By 3:00pm",
        rating: 4.1,
      },
      {
        name: "Shake Shack",
        type: "FOOD",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=300&fit=crop",
        deliveryTime: "By 8:30am",
        rating: 4.4,
      },
      {
        name: "Chipotle",
        type: "FOOD",
        phone: faker.phone.number(),
        logoUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop",
        bannerUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=300&fit=crop",
        deliveryTime: "By 9:00am",
        rating: 4.3,
      }
    ]

    const merchantRecords = await Promise.all(
      merchantData.map((merchant) =>
        prisma.merchant.create({
          data: {
            businessName: merchant.name,
            slug: faker.helpers.slugify(merchant.name),
            phone: merchant.phone,
            logoUrl: merchant.logoUrl,
            bannerUrl: merchant.bannerUrl,
            isVerified: true,
            merchantType: merchant.type as 'FOOD' | 'PHARMACY' | 'GROCERY',
            deliveryTime: merchant.deliveryTime,
            rating: merchant.rating,
            address: {
              latitude: faker.location.latitude(),
              longitude: faker.location.longitude(),
            },
            categories: {
              create: merchantCategories.map(category => ({
                categoryId: category.id,
                assignedAt: new Date(),
              })),
            },
          },
        }),
      ),
    )

    // Connect categories to merchants using the junction table
    await Promise.all(
      merchantRecords.flatMap(merchant => {
        // Assign 2-4 random categories to each merchant
        const merchantCategories = randomArrayElements(categoryRecords, { min: 2, max: 4 })

        return merchantCategories.map(async (category) => {
          // Create the relationship in the junction table
          return prisma.categoryOnMerchant.create({
            data: {
              merchantId: merchant.id,
              categoryId: category.id,
            },
          })
        })
      }),
    )

    // Seed UserMerchantManager relationships
    await Promise.all(
      merchantRecords.flatMap(merchant =>
        Array(faker.number.int({ min: 1, max: 3 }))
          .fill(null)
          .map(async () => {
            const randomUser = faker.helpers.arrayElement(userRecords) as { id: string }
            // Check if this user-merchant relationship already exists
            const existingRelation = await prisma.userMerchantManager.findUnique({
              where: {
                userId_merchantId: {
                  userId: randomUser.id,
                  merchantId: merchant.id,
                },
              },
            })

            if (!existingRelation) {
              return prisma.userMerchantManager.create({
                data: {
                  userId: randomUser.id,
                  merchantId: merchant.id,
                },
              })
            }
            return null
          })
          .filter(Boolean),
      ),
    )

    // Seed Wallets for users
    await Promise.all(
      userRecords.map(user =>
        prisma.wallet.create({
          data: {
            userId: user.id,
            balance: faker.number.float({ min: 0, max: 1000 }),
            currency: 'USD',
          },
        }),
      ),
    )


    // Instacart-style product data
    const productTemplates = [
      // Grocery products
      { name: "Organic Bananas", category: "Produce", price: 2.99, compareAtPrice: 3.49, unit: "lb", badges: ["ORGANIC", "BEST_SELLER"] },
      { name: "Fresh Atlantic Salmon", category: "Meat & Seafood", price: 12.99, compareAtPrice: 14.99, unit: "lb", badges: ["BEST_SELLER", "NON_GMO"] },
      { name: "Organic Free Range Eggs", category: "Dairy & Eggs", price: 5.99, compareAtPrice: 6.99, unit: "dozen", badges: ["ORGANIC", "NON_GMO"] },
      { name: "Sourdough Bread Loaf", category: "Bakery", price: 4.99, compareAtPrice: 5.49, unit: "loaf", badges: ["NO_PRESERVATIVES"] },
      { name: "Organic Spinach", category: "Produce", price: 3.49, compareAtPrice: 3.99, unit: "bunch", badges: ["ORGANIC", "LOW_FAT"] },
      { name: "Grass-Fed Ground Beef", category: "Meat & Seafood", price: 8.99, compareAtPrice: 9.99, unit: "lb", badges: ["ORGANIC", "NON_GMO"] },
      { name: "Greek Yogurt", category: "Dairy & Eggs", price: 4.49, compareAtPrice: 4.99, unit: "container", badges: ["LOW_FAT", "NON_GMO"] },
      { name: "Organic Strawberries", category: "Produce", price: 5.99, compareAtPrice: 6.99, unit: "lb", badges: ["ORGANIC", "BEST_SELLER"] },

      // Pharmacy products
      { name: "Advil Pain Relief", category: "Health & Beauty", price: 9.99, compareAtPrice: 11.99, unit: "bottle", badges: ["BEST_SELLER"] },
      { name: "Vitamin D3 Supplement", category: "Health & Beauty", price: 14.99, compareAtPrice: 16.99, unit: "bottle", badges: ["NON_GMO"] },
      { name: "Hand Sanitizer", category: "Health & Beauty", price: 3.99, compareAtPrice: 4.49, unit: "bottle", badges: ["BEST_SELLER"] },
      { name: "Allergy Relief Medicine", category: "Health & Beauty", price: 12.99, compareAtPrice: 14.99, unit: "box", badges: ["NON_GMO"] },

      // Food products
      { name: "Shake Shack Burger", category: "Food", price: 8.99, compareAtPrice: 9.99, unit: "burger", badges: ["BEST_SELLER"] },
      { name: "Chipotle Burrito Bowl", category: "Food", price: 11.99, compareAtPrice: 12.99, unit: "bowl", badges: ["NON_GMO"] },
      { name: "Caesar Salad", category: "Food", price: 9.99, compareAtPrice: 10.99, unit: "salad", badges: ["LOW_FAT"] },
      { name: "Margherita Pizza", category: "Food", price: 14.99, compareAtPrice: 16.99, unit: "pizza", badges: ["NEW"] },
    ]

    // Seed Products with realistic Instacart-style data
    const productRecords = await Promise.all(
      productTemplates.map(async (template, index) => {
        const productMedia = mediaRecords[index % mediaRecords.length]
        const productCategories = categoryRecords.filter(cat =>
          cat.name.toLowerCase().includes(template.category.toLowerCase().split(' ')[0])
        )

        const basePrice = template.price
        const savings = template.compareAtPrice ? template.compareAtPrice - basePrice : 0

        // Create additional media records for product images
        const productImageCount = faker.number.int({ min: 2, max: 5 })
        const productImages = await Promise.all(
          Array(productImageCount)
            .fill(null)
            .map(async (_, i) => {
              const imageUrl = unsplashImages[(index + i) % unsplashImages.length]
              return prisma.media.create({
                data: {
                  fileName: `${faker.helpers.slugify(template.name)}_img_${i + 1}.jpg`,
                  creatorId: creatorId,
                  url: imageUrl,
                  blurDataUrl: await getBlurDataUrl(imageUrl),
                },
              })
            })
        )

        return prisma.product.create({
          data: {
            creatorId: creatorId,
            title: template.name,
            slug: faker.helpers.slugify(template.name),
            description: `${template.name} - Premium quality ${template.category.toLowerCase()} product`,
            price: basePrice,
            compareAtPrice: template.compareAtPrice,
            inventory: {
              quantity: faker.number.int({ min: 10, max: 100 }),
              lowStockThreshold: faker.number.int({ min: 5, max: 15 }),
              stockQuantity: faker.number.int({ min: 20, max: 200 }),
            },
            unit: template.unit,
            status: 'VERIFIED',
            visibility: true,
            rating: faker.number.float({ min: 3.5, max: 5.0 }),
            reviewCount: faker.number.int({ min: 50, max: 500 }),
            stock: faker.number.int({ min: 20, max: 200 }),
            badges: template.badges as ('BEST_SELLER' | 'ORGANIC' | 'NO_PRESERVATIVES' | 'LOW_FAT' | 'LOW_SUGAR' | 'NON_GMO' | 'NEW' | 'SALE')[],
            weight: template.unit === 'lb' ? faker.number.float({ min: 0.5, max: 5.0 }) : undefined,
            weightUnit: template.unit === 'lb' ? 'lb' : undefined,
            metadata: {
              seoTitle: template.name,
              seoDescription: `Buy ${template.name} online with fast delivery`,
              keywords: [template.category.toLowerCase(), 'grocery', 'delivery', 'fresh'],
            },
            merchantId: faker.helpers.arrayElement(merchantRecords.filter(m =>
              (template.category === 'Health & Beauty' && m.merchantType === 'PHARMACY') ||
              (template.category === 'Food' && m.merchantType === 'FOOD') ||
              (m.merchantType === 'GROCERY')
            )).id,
            // Connect to main product image and additional images
            images: {
              connect: [
                { id: productMedia.id }, // Main product image
                ...productImages.map(img => ({ id: img.id })) // Additional images
              ]
            },
            categories: {
              create: productCategories.slice(0, 2).map(category => ({
                categoryId: category.id,
                assignedAt: new Date(),
              })),
            },
          },
        })
      }),
    )

    // Now seed wishlist items after products exist
    await Promise.all(
      userRecords.flatMap(user =>
        Array(faker.number.int({ min: 0, max: 5 }))
          .fill(null)
          .map(async () => {
            if (productRecords.length === 0) return null

            const randomProduct = faker.helpers.arrayElement(productRecords) as { id: string }
            // Check if this wishlist item already exists
            const existingWishlist = await prisma.wishlist.findUnique({
              where: {
                productId_userId: {
                  productId: randomProduct.id,
                  userId: user.id,
                },
              },
            })

            if (!existingWishlist) {
              return prisma.wishlist.create({
                data: {
                  userId: user.id,
                  productId: randomProduct.id,
                },
              })
            }
            return null
          })
          .filter(Boolean),
      ),
    )

    // Seed Orders and OrderItems
    const orderRecords = await Promise.all(
      Array(15)
        .fill(null)
        .map(async () => {
          const randomUser = faker.helpers.arrayElement(userRecords) as { id: string; email: string | null; fullName: string | null; phone: string | null }
          const orderItems = Array(faker.number.int({ min: 1, max: 3 }))
            .fill(null)
            .map(() => {
              const randomProduct = faker.helpers.arrayElement(productRecords) as { id: string; price: number }
              return {
                productId: randomProduct.id,
                quantity: faker.number.int({ min: 1, max: 5 }),
                price: randomProduct.price,
              }
            })

          const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const shipping = faker.number.float({ min: 5, max: 20 })
          const discount = faker.number.float({ min: 0, max: subtotal * 0.2 })
          const total = subtotal + shipping - discount
          const deliveryFee = faker.number.float({ min: 2, max: 10 })

          return prisma.order.create({
            data: {
              merchantId: faker.helpers.arrayElement(merchantRecords).id,
              deliveryInfo: {
                address: faker.location.streetAddress(),
                additionalNotes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
                delivery_latitude: faker.location.latitude(),
                delivery_longitude: faker.location.longitude(),
              },
              orderPrices: {
                subtotal,
                shipping,
                discount,
                total,
                deliveryFee,
              },
              status: faker.helpers.arrayElement([
                'PENDING',
                'ACCEPTED_BY_MERCHANT',
                'ACCEPTED_BY_DRIVER',
                'ON_THE_WAY',
                'COMPLETED'
              ]),
              userId: randomUser.id,
              pickupCode: Math.random() > 0.5 ? faker.string.alphanumeric(6).toUpperCase() : null,
              deliveryCode: Math.random() > 0.5 ? faker.string.alphanumeric(6).toUpperCase() : null,
              items: {
                create: orderItems.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
            },
            include: {
              items: true,
            },
          })
        }),
    )

    // Seed Transactions
    await Promise.all(
      orderRecords.map(async (order) => {
        const randomUser = userRecords.find(u => u.id === order.userId)
        if (!randomUser) return null

        // Get user's wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: randomUser.id }
        })

        if (!wallet) return null

        return prisma.transaction.create({
          data: {
            walletId: wallet.id,
            orderId: order.id,
            amount: order.orderPrices.total,
            type: 'debit',
            description: `Payment for order ${order.id}`,
            status: order.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
          },
        })
      }).filter(Boolean),
    )

    // Seed Payments
    await Promise.all(
      orderRecords.map(order => {
        if (Math.random() > 0.7) { // Only create payments for some orders
          return prisma.payment.create({
            data: {
              customerId: order.userId,
              amountTotal: order.orderPrices.total,
              merchantPayout: order.orderPrices.total * 0.85, // Merchant gets 85%
              driverPayout: order.orderPrices.deliveryFee * 0.8, // Driver gets 80% of delivery fee
              platformFee: order.orderPrices.total * 0.15, // Platform gets 15%
              status: order.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
              Order: {
                connect: { id: order.id }
              },
            },
          })
        }
        return null
      }).filter(Boolean),
    )



    // console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error during database seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default seedDatabase

// If running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
}