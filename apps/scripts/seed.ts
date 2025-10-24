
import { faker } from '@faker-js/faker'
import { DriverStatus, UserRole, ZoneCode, ZoneStatus } from '@prisma/client'
import { env } from '../envConfig.js'
import { prisma } from '../lib/prisma.js'

// Verify env is loaded
console.info('Database URL exists:', !!env.DATABASE_URL)
console.info(env.DATABASE_URL)

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
    console.error({ message: 'Error generating blur placeholder:', err })
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
 */
async function runSeed() {
  try {
    console.info('Starting database seeding...')

    // Run seed function
    await seedDatabase()

    console.info('Seeding completed successfully.')

    // Close the connection
    process.exit(0)
  } catch (error) {
    console.error({ message: 'Seeding failed:', error })
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

    // Delete delivery zones
    await prisma.deliveryZone.deleteMany()

    // Handle self-referential relationship in Category
    await prisma.category.updateMany({
      data: {},
    })
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
    const userRecords = await Promise.all(Array(5)
      .fill(null)
      .map(async (_, index) => {
        const roles = index < 5
          ? ['customer']
          : index < 10
            ? ['customer', 'merchant']
            : index < 15
              ? ['customer', 'driver']  // Drivers
              : ['super_admin'];

        const isDriver = roles.includes('driver');
        const driverStatus = isDriver
          ? faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED'])
          : null;

        const email = faker.internet.email().toLowerCase();

        return prisma.user.create({
          data: {
            id: faker.database.mongodbObjectId(),
            email,
            name: faker.person.fullName(),
            phone: faker.phone.number(),
            roles: roles as UserRole[],
            cni: isDriver ? faker.string.alphanumeric(12).toUpperCase() : null,
            driverDocument: isDriver ? faker.string.alphanumeric(12).toUpperCase() : null,
            ...(isDriver
              ? { driverStatus: driverStatus as DriverStatus }
              : {}),
          },
        });
      })
    );

    console.info(`✅ Created ${userRecords.length} users with different roles`);

    // Create wallets for all users including drivers
    await Promise.all(
      userRecords.map((user) =>
        prisma.wallet.create({
          data: {
            userId: user.id,
            balance: faker.number.float({ min: 0, max: 1000000, fractionDigits: 2 }),
            currency: 'USD',
          },
        })
      )
    );

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

    // Seed Categories
    for (let i = 0; i < categoryNames.length; i++) {
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

    // Seed Merchants
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
              latitude: 3.8667, // Yaoundé coordinates
              longitude: 11.5167,
            },
          },
        }),
      ),
    )

    console.info(`✅ Created ${merchantRecords.length} merchants`);

    const deliveryZonesData = [
      {
        name: "Zone Centre-Ville",
        code: ZoneCode.INNER,
        deliveryFee: 2.99,
        estimatedDeliveryMinutes: 25,
        minOrderAmount: null,
        color: "#10b981",
        priority: 3,
        landmarks: [
          {
            name: "Mendong",
            coordinates: {
              lng: 11.5170,
              lat: 3.8634
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Bastos",
            coordinates: {
              lng: 11.5050,
              lat: 3.8700
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Byem Assi Ecole",
            coordinates: {
              lng: 11.5120,
              lat: 3.8580
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Centre Ville",
            coordinates: {
              lng: 11.5180,
              lat: 3.8667
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Omnisport",
            coordinates: {
              lng: 11.5200,
              lat: 3.8720
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Quartier du Lac",
            coordinates: {
              lng: 11.5140,
              lat: 3.8650
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Nlongkak",
            coordinates: {
              lng: 11.5090,
              lat: 3.8610
            },
            category: "neighborhood",
            isPopular: false
          }
        ],
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [11.5000, 3.8500],
              [11.5300, 3.8500],
              [11.5300, 3.8800],
              [11.5000, 3.8800],
              [11.5000, 3.8500]
            ]
          ]
        }
      },
      {
        name: "Zone Intermédiaire",
        code: ZoneCode.MID,
        deliveryFee: 3.99,
        estimatedDeliveryMinutes: 35,
        minOrderAmount: 15,
        color: "#3b82f6",
        priority: 2,
        // NEW: Add landmarks
        landmarks: [
          {
            name: "Melen",
            coordinates: {
              lng: 11.5000,
              lat: 3.8600
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Nkolndongo",
            coordinates: {
              lng: 11.5100,
              lat: 3.8550
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Essos",
            coordinates: {
              lng: 11.5200,
              lat: 3.8750
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Nkol Eton",
            coordinates: {
              lng: 11.5050,
              lat: 3.8650
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Mokolo",
            coordinates: {
              lng: 11.5150,
              lat: 3.8700
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Ngoa Ekelle",
            coordinates: {
              lng: 11.5080,
              lat: 3.8620
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Briqueterie",
            coordinates: {
              lng: 11.5180,
              lat: 3.8680
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Elig Essono",
            coordinates: {
              lng: 11.5020,
              lat: 3.8580
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Biyem Assi",
            coordinates: {
              lng: 11.4980,
              lat: 3.8540
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Emana",
            coordinates: {
              lng: 11.5220,
              lat: 3.8780
            },
            category: "neighborhood",
            isPopular: false
          }
        ],
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [11.4800, 3.8400],
              [11.5400, 3.8400],
              [11.5400, 3.8900],
              [11.4800, 3.8900],
              [11.4800, 3.8400]
            ]
          ]
        }
      },
      {
        name: "Zone Périphérique",
        code: ZoneCode.OUTER,
        deliveryFee: 5.99,
        estimatedDeliveryMinutes: 50,
        minOrderAmount: 25,
        color: "#f59e0b",
        priority: 1,
        // NEW: Add landmarks
        landmarks: [
          {
            name: "Ekounou",
            coordinates: {
              lng: 11.5400,
              lat: 3.8900
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Emombo",
            coordinates: {
              lng: 11.4700,
              lat: 3.8500
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Nkolbisson",
            coordinates: {
              lng: 11.4600,
              lat: 3.8700
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Simbock",
            coordinates: {
              lng: 11.5500,
              lat: 3.8800
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Mvog Ada",
            coordinates: {
              lng: 11.5100,
              lat: 3.9000
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Odza",
            coordinates: {
              lng: 11.5300,
              lat: 3.8950
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Nkomo",
            coordinates: {
              lng: 11.4800,
              lat: 3.8600
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Mballa 2",
            coordinates: {
              lng: 11.5600,
              lat: 3.8850
            },
            category: "neighborhood",
            isPopular: false
          },
          {
            name: "Nsimeyong",
            coordinates: {
              lng: 11.5200,
              lat: 3.9050
            },
            category: "neighborhood",
            isPopular: false
          }
        ],
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [11.4500, 3.8200],
              [11.5700, 3.8200],
              [11.5700, 3.9100],
              [11.4500, 3.9100],
              [11.4500, 3.8200]
            ]
          ]
        }
      },
      {
        name: "Hub Aéroport",
        code: ZoneCode.HUB_A,
        deliveryFee: 4.99,
        estimatedDeliveryMinutes: 40,
        minOrderAmount: 20,
        color: "#8b5cf6",
        priority: 2,
        landmarks: [
          {
            name: "Nsimalen",
            coordinates: {
              lng: 11.5530,
              lat: 3.7220
            },
            category: "neighborhood",
            isPopular: true
          },
          {
            name: "Aéroport",
            coordinates: {
              lng: 11.5535,
              lat: 3.7236
            },
            category: "airport",
            isPopular: true
          },
          {
            name: "Zone Aéroportuaire",
            coordinates: {
              lng: 11.5600,
              lat: 3.7300
            },
            category: "neighborhood",
            isPopular: false
          }
        ],
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [11.5400, 3.7200],
              [11.5800, 3.7200],
              [11.5800, 3.7500],
              [11.5400, 3.7500],
              [11.5400, 3.7200]
            ]
          ]
        }
      }
    ];

    const deliveryZoneRecords = await Promise.all(
      deliveryZonesData.map((zone) =>
        prisma.deliveryZone.create({
          data: {
            name: zone.name,
            code: zone.code,
            description: `Delivery zone covering ${zone.landmarks.map(l => l.name).join(', ')}`,
            deliveryFee: zone.deliveryFee,
            geometry: zone.geometry,
            landmarks: zone.landmarks,
            priority: zone.priority,
            status: ZoneStatus.ACTIVE,
            version: 1,
            estimatedDeliveryMinutes: zone.estimatedDeliveryMinutes,
            color: zone.color,
          },
        })
      )
    );

    console.info(`✅ Created ${deliveryZoneRecords.length} delivery zones`);

    // Seed UserMerchantManager relationships
    await Promise.all(
      merchantRecords.flatMap(merchant =>
        Array(faker.number.int({ min: 1, max: 3 }))
          .fill(null)
          .map(async () => {
            const randomUser = faker.helpers.arrayElement(userRecords) as { id: string }
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

    // Instacart-style product data
    const productTemplates = [
      { name: "Organic Bananas", category: "Produce", price: 2.99, compareAtPrice: 3.49, unit: "lb", badges: ["ORGANIC", "BEST_SELLER"] },
      { name: "Fresh Atlantic Salmon", category: "Meat & Seafood", price: 12.99, compareAtPrice: 14.99, unit: "lb", badges: ["BEST_SELLER", "NON_GMO"] },
      { name: "Organic Free Range Eggs", category: "Dairy & Eggs", price: 5.99, compareAtPrice: 6.99, unit: "dozen", badges: ["ORGANIC", "NON_GMO"] },
      { name: "Sourdough Bread Loaf", category: "Bakery", price: 4.99, compareAtPrice: 5.49, unit: "loaf", badges: ["NO_PRESERVATIVES"] },
      { name: "Organic Spinach", category: "Produce", price: 3.49, compareAtPrice: 3.99, unit: "bunch", badges: ["ORGANIC", "LOW_FAT"] },
      { name: "Grass-Fed Ground Beef", category: "Meat & Seafood", price: 8.99, compareAtPrice: 9.99, unit: "lb", badges: ["ORGANIC", "NON_GMO"] },
      { name: "Greek Yogurt", category: "Dairy & Eggs", price: 4.49, compareAtPrice: 4.99, unit: "container", badges: ["LOW_FAT", "NON_GMO"] },
      { name: "Organic Strawberries", category: "Produce", price: 5.99, compareAtPrice: 6.99, unit: "lb", badges: ["ORGANIC", "BEST_SELLER"] },
      { name: "Advil Pain Relief", category: "Health & Beauty", price: 9.99, compareAtPrice: 11.99, unit: "bottle", badges: ["BEST_SELLER"] },
      { name: "Vitamin D3 Supplement", category: "Health & Beauty", price: 14.99, compareAtPrice: 16.99, unit: "bottle", badges: ["NON_GMO"] },
      { name: "Hand Sanitizer", category: "Health & Beauty", price: 3.99, compareAtPrice: 4.49, unit: "bottle", badges: ["BEST_SELLER"] },
      { name: "Allergy Relief Medicine", category: "Health & Beauty", price: 12.99, compareAtPrice: 14.99, unit: "box", badges: ["NON_GMO"] },
      { name: "Shake Shack Burger", category: "Food", price: 8.99, compareAtPrice: 9.99, unit: "burger", badges: ["BEST_SELLER"] },
      { name: "Chipotle Burrito Bowl", category: "Food", price: 11.99, compareAtPrice: 12.99, unit: "bowl", badges: ["NON_GMO"] },
      { name: "Caesar Salad", category: "Food", price: 9.99, compareAtPrice: 10.99, unit: "salad", badges: ["LOW_FAT"] },
      { name: "Margherita Pizza", category: "Food", price: 14.99, compareAtPrice: 16.99, unit: "pizza", badges: ["NEW"] },
    ]

    // Seed Products
    const productRecords = await Promise.all(
      productTemplates.map(async (template, index) => {
        const productMedia = mediaRecords[index % mediaRecords.length]
        const productCategories = categoryRecords.filter(cat =>
          cat.name.toLowerCase().includes(template.category.toLowerCase().split(' ')[0])
        )

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
            price: template.price,
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
            images: {
              connect: [
                { id: productMedia.id },
                ...productImages.map(img => ({ id: img.id }))
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

    console.info(`✅ Created ${productRecords.length} products`);

    // Seed wishlist items
    await Promise.all(
      userRecords.flatMap(user =>
        Array(faker.number.int({ min: 0, max: 5 }))
          .fill(null)
          .map(async () => {
            if (productRecords.length === 0) return null

            const randomProduct = faker.helpers.arrayElement(productRecords) as { id: string }
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


    // Seed Orders with Delivery Zones
    const orderRecords = await Promise.all(
      Array(15)
        .fill(null)
        .map(async () => {
          const randomUser = faker.helpers.arrayElement(userRecords) as { id: string }
          const randomZone = faker.helpers.arrayElement(deliveryZoneRecords)

          const orderItems = Array(faker.number.int({ min: 1, max: 3 }))
            .fill(null)
            .map(() => {
              const randomProduct = faker.helpers.arrayElement(productRecords) as { id: string; price: number }
              return {
                productId: randomProduct.id,
                quantity: faker.number.int({ min: 1, max: 5 }),
                price: randomProduct.price,
                images: unsplashImages,
              }
            })

          const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const shipping = faker.number.float({ min: 5, max: 20 })
          const discount = faker.number.float({ min: 0, max: subtotal * 0.2 })
          const deliveryFee = randomZone.deliveryFee
          const total = subtotal + shipping - discount

          return prisma.order.create({
            data: {
              merchantId: faker.helpers.arrayElement(merchantRecords).id,
              deliveryZoneId: randomZone.id,
              deliveryInfo: {
                additionalNotes: `${faker.location.streetAddress()}, Yaoundé`,
                location: {
                  lng: deliveryZonesData[0].landmarks[0].coordinates.lng, // Yaoundé longitude
                  lat: deliveryZonesData[0].landmarks[0].coordinates.lat // Yaoundé latitude
                },
                landmark: deliveryZonesData[0].landmarks[0],
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
                'IN_PREPARATION',
                'READY_TO_DELIVER',
                'ON_THE_WAY',
                'COMPLETED'
              ]),
              userId: randomUser.id,
              pickupCode: faker.string.alphanumeric(6).toUpperCase(),
              deliveryCode: faker.string.alphanumeric(6).toUpperCase(),
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

    console.info(`✅ Created ${orderRecords.length} orders with delivery zones`);

    // Seed Transactions
    await Promise.all(
      orderRecords.map(async (order) => {
        const randomUser = userRecords.find(u => u.id === order.userId)
        if (!randomUser) return null

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

    console.info(`✅ Created transactions`);

    // Seed Payments
    await Promise.all(
      orderRecords.map(order => {
        if (Math.random() > 0.7) {
          return prisma.payment.create({
            data: {
              customerId: order.userId,
              amountTotal: order.orderPrices.total,
              merchantPayout: order.orderPrices.total * 0.85,
              driverPayout: order.orderPrices.deliveryFee * 0.8,
              platformFee: order.orderPrices.total * 0.15,
              status: order.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
              gateway: faker.helpers.arrayElement([
                'STRIPE',
                'CASH'
              ]),
              Order: {
                connect: { id: order.id }
              },
            },
          })
        }
        return null
      }).filter(Boolean),
    )

    console.info(`✅ Created payments`);
    console.info('');
    console.info('📊 Database seeding summary:');
    console.info(`   - ${userRecords.length} users`);
    console.info(`   - ${merchantRecords.length} merchants`);
    console.info(`   - ${deliveryZoneRecords.length} delivery zones`);
    console.info(`   - ${categoryRecords.length} categories`);
    console.info(`   - ${productRecords.length} products`);
    console.info(`   - ${orderRecords.length} orders`);
    console.info('');

  } catch (error) {
    console.error({ message: 'Error during database seeding:', error })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default seedDatabase

// If running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().catch(error => {
    console.error({ message: 'Script failed:', error })
    process.exit(1)
  })
}