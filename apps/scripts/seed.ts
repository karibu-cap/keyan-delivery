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
      data: { },
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
      Array(20)
        .fill(null)
        .map(async (_, index) => {
          // Use a curated list of reliable Unsplash images
         

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
       'Grocery',
       'Pharmacy',
       'Food',
     ]
    const categoryRecords: Array<{ id: string; name: string; slug: string }> = []

    // Seed Categories with sequential creation
    
    for (let i = 0; i < categoryNames.length; i++) {
      const category = await prisma.category.create({
        data: {
          name: categoryNames[i],
          slug: categoryNames[i].toLocaleLowerCase(),
          description: faker.commerce.productDescription(),
          ...(mediaRecords.length > 0
            ? {
                image: {
                  connect: {
                    id: mediaRecords[faker.number.int({ min: 0, max: mediaRecords.length - 1 })].id,
                  },
                },
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
    // Seed Merchants
    const merchantRecords = await Promise.all(
      Array(5)
        .fill(null)
        .map((_, index) =>
          prisma.merchant.create({
            data: {
              businessName: faker.company.name(),
              phone: faker.phone.number(),
              logoUrl: unsplashImages[index % unsplashImages.length],
              bannerUrl: unsplashImages[index % unsplashImages.length],
              isVerified: Math.random() > 0.1,
              deliveryTime: faker.date.past().toISOString(),
              rating: faker.number.float({ min: 0, max: 5 }),
              createdAt: faker.date.past().toISOString(),
              updatedAt: faker.date.past().toISOString(),
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


    // Seed Products first (needed for orders and wishlists)
    const productRecords = await Promise.all(
      Array(50)
        .fill(null)
        .map(async () => {
          const productMedia = faker.helpers.arrayElement(mediaRecords) as { id: string }
          const productCategories = randomArrayElements(categoryRecords, { min: 1, max: 2 })

          return prisma.product.create({
            data: {
              creatorId: creatorId,
              title: faker.commerce.productName(),
              slug: faker.helpers.slugify(faker.commerce.productName()),
              description: faker.commerce.productDescription(),
              inventory: {
                quantity: faker.number.int({ min: 0, max: 100 }),
                lowStockThreshold: faker.number.int({ min: 5, max: 20 }),
                stockQuantity: faker.number.int({ min: 0, max: 100 }),
              },
              unit: faker.helpers.arrayElement(['piece', 'kg', 'lb', 'pack', 'box', 'bottle']),
              mediaId: productMedia.id,
               price: parseFloat(faker.commerce.price()),
               status: faker.helpers.arrayElement(['DRAFT', 'VERIFIED', 'REJECTED'] as const),
               visibility: Math.random() > 0.2, // 80% visible by default
               metadata: {
                 seoTitle: faker.lorem.words(3),
                 seoDescription: faker.lorem.sentence(),
                 keywords: faker.lorem.words(5).split(' '),
               },
               merchantId: faker.helpers.arrayElement(merchantRecords).id,
               categories: {
                 create: productCategories.map(category => ({
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