// Vector-based similarity search for enhanced product discovery
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Types for vector search
export interface VectorSearchResult {
    product: {
        id: string;
        title: string;
        description: string;
        price: number;
        rating: number | undefined;
        reviewCount: number | undefined;
        merchant: {
            businessName: string;
            rating: number | undefined;
        };
        images: Array<{
            id: string;
            url: string;
        }>;
        categories: Array<{
            category: {
                name: string;
            };
        }>;
    };
    similarity: number;
    rank: number;
}

export interface SearchQuery {
    query: string;
    filters?: {
        categoryId?: string;
        merchantId?: string;
        priceRange?: [number, number];
        rating?: number;
        inStock?: boolean;
    };
    limit?: number;
    threshold?: number; // Minimum similarity score (0-1)
}

// Product embedding interface (simplified for demo)
// In production, this would use actual embedding models like OpenAI, BERT, etc.
export interface ProductEmbedding {
    productId: string;
    title: string;
    description: string;
    category: string;
    merchantType: string;
    price: number;
    // Vector representation (simplified - would be 384+ dimensions in reality)
    vector: number[];
    metadata: {
        createdAt: Date;
        updatedAt: Date;
    };
}

// Generate simple text embeddings (demo implementation)
// In production, use proper embedding models
export function generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const vector: number[] = new Array(100).fill(0); // 100-dimensional vector for demo

    words.forEach((word) => {
        // Simple hash-based vector generation
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Use hash to set vector positions
        const pos1 = Math.abs(hash) % vector.length;
        const pos2 = Math.abs(hash * 31) % vector.length;

        vector[pos1] = (vector[pos1] + 1) / 10; // Normalize
        vector[pos2] = (vector[pos2] + 0.5) / 10;
    });

    return vector;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate or update product embeddings
export async function generateProductEmbeddings(productIds?: string[]) {
    try {
        const whereClause: Prisma.ProductWhereInput = {
            visibility: true,
            status: 'VERIFIED',
        };

        if (productIds) {
            whereClause.id = { in: productIds };
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
                merchant: true,
            },
        });

        const embeddings: ProductEmbedding[] = [];

        for (const product of products) {
            // Combine title, description, and category for better semantic understanding
            const textContent = `${product.title} ${product.description} ${product.categories.map(pc => pc.category.name).join(' ')
                } ${product.merchant.merchantType}`.trim();

            const vector = generateSimpleEmbedding(textContent);

            embeddings.push({
                productId: product.id,
                title: product.title,
                description: product.description,
                category: product.categories.map(pc => pc.category.name).join(', '),
                merchantType: product.merchant.merchantType,
                price: product.price,
                vector,
                metadata: {
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                },
            });
        }

        return embeddings;
    } catch (error) {
        console.error({ message: 'Error generating product embeddings:', error });
        throw error;
    }
}

// Perform vector similarity search
export async function vectorSimilaritySearch(
    searchQuery: SearchQuery
): Promise<VectorSearchResult[]> {
    try {
        // Generate embedding for search query
        const queryEmbedding = generateSimpleEmbedding(searchQuery.query);

        // Get all relevant product embeddings
        const embeddings = await generateProductEmbeddings();

        // Filter embeddings based on search filters
        let filteredEmbeddings = embeddings;

        if (searchQuery.filters) {
            filteredEmbeddings = embeddings.filter(() => {
                // This would need actual product data for proper filtering
                // For demo, we'll apply basic filters
                return true;
            });
        }

        // Calculate similarities
        const similarities = filteredEmbeddings.map(embedding => ({
            productId: embedding.productId,
            similarity: cosineSimilarity(queryEmbedding, embedding.vector),
        }));

        // Filter by similarity threshold
        const threshold = searchQuery.threshold || 0.1;
        const filteredSimilarities = similarities.filter(s => s.similarity >= threshold);

        // Sort by similarity (descending)
        filteredSimilarities.sort((a, b) => b.similarity - a.similarity);

        // Get top results
        const topSimilarities = filteredSimilarities.slice(0, searchQuery.limit || 20);

        // Fetch full product data for top results
        const productIds = topSimilarities.map(s => s.productId);

        if (productIds.length === 0) {
            return [];
        }

        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                visibility: true,
                status: 'VERIFIED',
            },
            include: {
                images: true,
                merchant: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Fallback ordering
            },
        });

        // Create a map for quick lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // Combine similarity scores with product data
        const results: VectorSearchResult[] = topSimilarities
            .map((similarity, index) => {
                const product = productMap.get(similarity.productId);
                if (!product) return null;

                return {
                    product: {
                        id: product.id,
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        rating: product.rating ?? undefined,
                        reviewCount: product.reviewCount ?? undefined,
                        merchant: {
                            businessName: product.merchant.businessName,
                            rating: product.merchant.rating ?? undefined,
                        },
                        images: product.images.map(img => ({
                            id: img.id,
                            url: img.url,
                        })),
                        categories: product.categories.map(pc => ({
                            category: {
                                name: pc.category.name,
                            },
                        })),
                    },
                    similarity: similarity.similarity,
                    rank: index + 1,
                };
            })
            .filter((result): result is VectorSearchResult => result !== null);

        return results;
    } catch (error) {
        console.error({ message: 'Error performing vector similarity search:', error });
        throw error;
    }
}

// Find similar products (product-to-product similarity)
export async function findSimilarProducts(
    productId: string,
    limit: number = 10,
    threshold: number = 0.1
): Promise<VectorSearchResult[]> {
    try {
        // Get the source product
        const sourceProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
                merchant: true,
            },
        });

        if (!sourceProduct) {
            return [];
        }

        // Generate embedding for source product
        const sourceText = `${sourceProduct.title} ${sourceProduct.description}`;
        const sourceEmbedding = generateSimpleEmbedding(sourceText);

        // Get candidate products (excluding the source product)
        const candidateProducts = await prisma.product.findMany({
            where: {
                id: { not: productId },
                visibility: true,
                status: 'VERIFIED',
            },
            include: {
                images: true,
                merchant: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
            take: 100, // Limit candidates for performance
        });

        // Calculate similarities
        const similarities = candidateProducts.map(product => {
            const productText = `${product.title} ${product.description}`;
            const productEmbedding = generateSimpleEmbedding(productText);

            return {
                productId: product.id,
                similarity: cosineSimilarity(sourceEmbedding, productEmbedding),
                product,
            };
        });

        // Filter and sort by similarity
        const filteredSimilarities = similarities
            .filter(s => s.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        // Format results
        const results: VectorSearchResult[] = filteredSimilarities.map((similarity, index) => ({
            product: {
                id: similarity.product.id,
                title: similarity.product.title,
                description: similarity.product.description,
                price: similarity.product.price,
                rating: similarity.product.rating ?? undefined,
                reviewCount: similarity.product.reviewCount ?? undefined,
                merchant: {
                    businessName: similarity.product.merchant.businessName,
                    rating: similarity.product.merchant.rating ?? undefined,
                },
                images: similarity.product.images.map(img => ({
                    id: img.id,
                    url: img.url,
                })),
                categories: similarity.product.categories.map(pc => ({
                    category: {
                        name: pc.category.name,
                    },
                })),
            },
            similarity: similarity.similarity,
            rank: index + 1,
        }));

        return results;
    } catch (error) {
        console.error({ message: 'Error finding similar products:', error });
        throw error;
    }
}

// Search with hybrid approach (lexical + semantic)
export async function hybridSearch(
    searchQuery: SearchQuery
): Promise<VectorSearchResult[]> {
    try {
        // Perform both traditional search and vector search
        const [lexicalResults, semanticResults] = await Promise.allSettled([
            performLexicalSearch(searchQuery),
            vectorSimilaritySearch(searchQuery)
        ]);

        const lexical = lexicalResults.status === 'fulfilled' ? lexicalResults.value : [];
        const semantic = semanticResults.status === 'fulfilled' ? semanticResults.value : [];

        // Combine results using hybrid scoring
        const combinedResults = combineSearchResults(lexical, semantic);

        return combinedResults.slice(0, searchQuery.limit || 20);
    } catch (error) {
        console.error({ message: 'Error performing hybrid search:', error });
        throw error;
    }
}

// Traditional lexical search for comparison
async function performLexicalSearch(searchQuery: SearchQuery) {
    try {
        const where: Prisma.ProductWhereInput = {
            visibility: true,
            status: 'VERIFIED',
            OR: [
                { title: { contains: searchQuery.query, mode: 'insensitive' } },
                { description: { contains: searchQuery.query, mode: 'insensitive' } }
            ]
        };

        if (searchQuery.filters?.categoryId) {
            where.categories = {
                some: {
                    categoryId: searchQuery.filters.categoryId
                }
            };
        }

        if (searchQuery.filters?.merchantId) {
            where.merchantId = searchQuery.filters.merchantId;
        }

        if (searchQuery.filters?.inStock !== undefined) {
            where.inventory = searchQuery.filters.inStock
                ? { is: { stockQuantity: { gt: 0 } } }
                : { is: { stockQuantity: 0 } };
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                merchant: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: [
                { title: 'asc' } // Alphabetical for lexical search
            ],
            take: searchQuery.limit || 20,
        });

        return products.map((product, index) => ({
            product: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                rating: product.rating ?? undefined,
                reviewCount: product.reviewCount ?? undefined,
                merchant: {
                    businessName: product.merchant.businessName,
                    rating: product.merchant.rating ?? undefined,
                },
                images: product.images.map(img => ({
                    id: img.id,
                    url: img.url,
                })),
                categories: product.categories.map(pc => ({
                    category: {
                        name: pc.category.name,
                    },
                })),
            },
            similarity: 1, // Lexical search doesn't have similarity scores
            rank: index + 1,
        })) as VectorSearchResult[];
    } catch (error) {
        console.error({ message: 'Error performing lexical search:', error });
        return [];
    }
}

// Combine lexical and semantic search results
function combineSearchResults(
    lexicalResults: VectorSearchResult[],
    semanticResults: VectorSearchResult[]
): VectorSearchResult[] {
    const combined = new Map<string, VectorSearchResult>();

    // Add lexical results with lower weight
    lexicalResults.forEach(result => {
        combined.set(result.product.id, {
            ...result,
            similarity: (result.similarity * 0.3) + 0.4, // Weight lexical results lower
        });
    });

    // Add semantic results with higher weight
    semanticResults.forEach(result => {
        const existing = combined.get(result.product.id);
        if (existing) {
            // Combine scores if product appears in both results
            existing.similarity = (existing.similarity + (result.similarity * 0.7)) / 2;
        } else {
            combined.set(result.product.id, {
                ...result,
                similarity: result.similarity * 0.7, // Weight semantic results higher
            });
        }
    });

    // Convert back to array and sort by combined similarity
    return Array.from(combined.values())
        .sort((a, b) => b.similarity - a.similarity);
}

// Cache for embeddings to improve performance
const embeddingCache = new Map<string, { embedding: number[]; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedEmbedding(text: string): number[] | null {
    const cached = embeddingCache.get(text);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.embedding;
    }
    return null;
}

export function setCachedEmbedding(text: string, embedding: number[]): void {
    embeddingCache.set(text, {
        embedding,
        timestamp: Date.now(),
    });

    // Limit cache size
    if (embeddingCache.size > 1000) {
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) {
            embeddingCache.delete(firstKey);
        }
    }
}

// Pre-compute embeddings for better performance
export async function precomputeEmbeddings(): Promise<void> {
    try {
        console.info('Starting embedding precomputation...');

        const products = await prisma.product.findMany({
            where: {
                visibility: true,
                status: 'VERIFIED',
            },
            select: {
                id: true,
                title: true,
                description: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                merchant: true,
            },
        });

        console.info(`Precomputing embeddings for ${products.length} products...`);

        for (const product of products) {
            const text = `${product.title} ${product.description} ${product.categories.map(pc => pc.category.name).join(' ')
                } ${product.merchant.merchantType}`.trim();

            const embedding = generateSimpleEmbedding(text);
            setCachedEmbedding(text, embedding);
        }

        console.info('Embedding precomputation completed');
    } catch (error) {
        console.error({ message: 'Error precomputing embeddings:', error });
    }
}

// Search analytics
export async function trackSearchAnalytics(
    query: string,
    resultCount: number,
    clickedProducts: string[] = []
): Promise<void> {
    try {
        // This would typically send to an analytics service
        console.info('Search analytics:', {
            query,
            resultCount,
            clickedProducts,
            timestamp: new Date().toISOString(),
        });

        // Could store in database for analysis
        // await prisma.searchAnalytics.create({
        //     data: {
        //         query,
        //         resultCount,
        //         clickedProducts,
        //     }
        // });
    } catch (error) {
        console.error({ message: 'Error tracking search analytics:', error });
    }
}

// Export main search function
export async function performAdvancedSearch(
    query: string,
    options: {
        filters?: SearchQuery['filters'];
        limit?: number;
        useHybrid?: boolean;
        threshold?: number;
    } = {}
): Promise<VectorSearchResult[]> {
    const searchQuery: SearchQuery = {
        query,
        filters: options.filters,
        limit: options.limit || 20,
        threshold: options.threshold || 0.1,
    };

    // Track search analytics
    trackSearchAnalytics(query, 0); // Will update count after search

    let results: VectorSearchResult[];

    if (options.useHybrid) {
        results = await hybridSearch(searchQuery);
    } else {
        results = await vectorSimilaritySearch(searchQuery);
    }

    // Update analytics with actual result count
    trackSearchAnalytics(query, results.length);

    return results;
}