// Dynamic OG Image Generation System - Clean TypeScript Version
// This file provides OG image generation functions for the application
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

// OG Image templates and configurations
export const OG_TEMPLATES = {
    PRODUCT: 'product',
    MERCHANT: 'merchant',
    CATEGORY: 'category',
    HOME: 'home',
} as const;

export type OGTemplate = typeof OG_TEMPLATES[keyof typeof OG_TEMPLATES];

// Color schemes for different content types
export const OG_COLORS = {
    PRIMARY: '#10b981',
    SECONDARY: '#059669',
    ACCENT: '#34d399',
    BACKGROUND: '#ffffff',
    TEXT: '#111827',
    TEXT_MUTED: '#6b7280',
    BORDER: '#e5e7eb',
} as const;

// Font configurations
export const OG_FONTS = {
    PRIMARY: 'Inter',
    SECONDARY: 'Inter',
} as const;

// Generate simple OG image for products
export async function generateProductOG(
    product: {
        title: string;
        price: number;
        image?: string;
        merchantName: string;
        categoryName?: string;
        rating?: number;
        badge?: string;
    },
    locale: string = 'en'
): Promise<ImageResponse> {
    return new ImageResponse(
        React.createElement('div', {
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: OG_COLORS.BACKGROUND,
                fontFamily: OG_FONTS.PRIMARY,
                position: 'relative',
            },
        },
            // Background Pattern
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${OG_COLORS.PRIMARY}15 0%, ${OG_COLORS.ACCENT}15 100%)`,
                    opacity: 0.1,
                }
            }),
            // Header
            React.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 32px',
                    backgroundColor: OG_COLORS.PRIMARY,
                    color: 'white',
                },
            },
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center' },
                },
                    React.createElement('div', {
                        style: {
                            width: 32,
                            height: 32,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        },
                    }, 'K'),
                    React.createElement('span', {
                        style: { fontSize: '18px', fontWeight: '600' }
                    }, 'Pataupesi Delivery')
                ),
                React.createElement('div', {
                    style: { fontSize: '14px', opacity: 0.9 }
                }, 'Fresh & Fast')
            ),
            // Main Content
            React.createElement('div', {
                style: {
                    display: 'flex',
                    flex: 1,
                    padding: '32px',
                    alignItems: 'center',
                    gap: '32px',
                },
            },
                // Product Image
                React.createElement('div', {
                    style: {
                        width: '200px',
                        height: '200px',
                        backgroundColor: OG_COLORS.BORDER,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        border: `2px solid ${OG_COLORS.BORDER}`,
                    },
                },
                    product.image ?
                        React.createElement('img', {
                            src: product.image,
                            alt: product.title,
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }
                        }) :
                        React.createElement('div', {
                            style: {
                                fontSize: '48px',
                                color: OG_COLORS.TEXT_MUTED,
                            }
                        }, '📦')
                ),
                // Product Info
                React.createElement('div', {
                    style: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '16px',
                    },
                },
                    // Category
                    ...(product.categoryName ? [React.createElement('div', {
                        style: {
                            fontSize: '14px',
                            color: OG_COLORS.PRIMARY,
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }
                    }, product.categoryName)] : []),
                    // Title
                    React.createElement('div', {
                        style: {
                            fontSize: '28px',
                            fontWeight: '700',
                            color: OG_COLORS.TEXT,
                            lineHeight: '1.2',
                            maxWidth: '400px',
                        }
                    }, product.title.length > 60 ? `${product.title.substring(0, 60)}...` : product.title),
                    // Merchant
                    React.createElement('div', {
                        style: {
                            fontSize: '16px',
                            color: OG_COLORS.TEXT_MUTED,
                        }
                    }, `by ${product.merchantName}`),
                    // Rating
                    ...(product.rating ? [React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        },
                    },
                        React.createElement('div', {
                            style: {
                                display: 'flex',
                                gap: '2px',
                            },
                        },
                            ...Array.from({ length: 5 }).map((_, i) =>
                                React.createElement('div', {
                                    key: i,
                                    style: {
                                        width: '16px',
                                        height: '16px',
                                        color: i < Math.floor(product.rating!) ? '#fbbf24' : OG_COLORS.BORDER,
                                    }
                                }, '★')
                            )
                        ),
                        React.createElement('span', {
                            style: { fontSize: '14px', color: OG_COLORS.TEXT_MUTED }
                        }, product.rating.toFixed(1))
                    )] : []),
                    // Price
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                        },
                    },
                        React.createElement('span', {
                            style: {
                                fontSize: '36px',
                                fontWeight: '800',
                                color: OG_COLORS.PRIMARY,
                            }
                        }, `$${product.price.toFixed(2)}`)
                    ),
                    // Call to Action
                    React.createElement('div', {
                        style: {
                            fontSize: '16px',
                            color: OG_COLORS.TEXT_MUTED,
                            marginTop: '8px',
                        }
                    }, 'Order now for fast delivery! 🚚')
                )
            ),
            // Footer
            React.createElement('div', {
                style: {
                    padding: '20px 32px',
                    backgroundColor: OG_COLORS.BORDER,
                    fontSize: '12px',
                    color: OG_COLORS.TEXT_MUTED,
                    textAlign: 'center',
                }
            }, 'Get fresh groceries delivered to your door')
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: OG_FONTS.PRIMARY,
                    data: await fetchFont('Inter-Bold'),
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: OG_FONTS.SECONDARY,
                    data: await fetchFont('Inter-Regular'),
                    style: 'normal',
                    weight: 400,
                },
            ],
        }
    );
}

// Generate OG image for merchants/stores
export async function generateMerchantOG(
    merchant: {
        businessName: string;
        merchantType: string;
        logoUrl?: string;
        bannerUrl?: string;
        rating?: number;
        deliveryTime?: string;
        isVerified: boolean;
    },
): Promise<ImageResponse> {
    return new ImageResponse(
        React.createElement('div', {
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: OG_COLORS.BACKGROUND,
                fontFamily: OG_FONTS.PRIMARY,
                position: 'relative',
            },
        },
            // Background
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${OG_COLORS.SECONDARY}20 0%, ${OG_COLORS.PRIMARY}20 100%)`,
                }
            }),
            // Header
            React.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px 32px',
                    backgroundColor: OG_COLORS.SECONDARY,
                    color: 'white',
                },
            },
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center' },
                },
                    React.createElement('div', {
                        style: {
                            width: 32,
                            height: 32,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        },
                    }, 'K'),
                    React.createElement('span', {
                        style: { fontSize: '18px', fontWeight: '600' }
                    }, 'Pataupesi Delivery')
                ),
                React.createElement('div', {
                    style: { fontSize: '14px', opacity: 0.9 }
                }, 'Store Partner')
            ),
            // Main Content
            React.createElement('div', {
                style: {
                    display: 'flex',
                    flex: 1,
                    padding: '48px 32px',
                    alignItems: 'center',
                    gap: '48px',
                },
            },
                // Store Logo
                React.createElement('div', {
                    style: {
                        width: '160px',
                        height: '160px',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        border: `3px solid ${OG_COLORS.BORDER}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    },
                },
                    merchant.logoUrl ?
                        React.createElement('img', {
                            src: merchant.logoUrl,
                            alt: merchant.businessName,
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }
                        }) :
                        React.createElement('div', {
                            style: {
                                fontSize: '64px',
                                color: OG_COLORS.PRIMARY,
                            }
                        }, '🏪'),
                    // Verified Badge
                    ...(merchant.isVerified ? [React.createElement('div', {
                        style: {
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '24px',
                            height: '24px',
                            backgroundColor: OG_COLORS.ACCENT,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                        },
                    }, '✓')] : [])
                ),
                // Store Info
                React.createElement('div', {
                    style: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '20px',
                    },
                },
                    // Store Name
                    React.createElement('div', {
                        style: {
                            fontSize: '36px',
                            fontWeight: '800',
                            color: OG_COLORS.TEXT,
                            lineHeight: '1.1',
                        }
                    }, merchant.businessName),
                    // Merchant Type
                    React.createElement('div', {
                        style: {
                            fontSize: '18px',
                            color: OG_COLORS.PRIMARY,
                            fontWeight: '600',
                            textTransform: 'capitalize',
                        }
                    }, `${merchant.merchantType.replace('_', ' ')} Store`),
                    // Rating and Delivery Time
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                        },
                    },
                        ...(merchant.rating ? [React.createElement('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            },
                        },
                            React.createElement('div', {
                                style: {
                                    display: 'flex',
                                    gap: '2px',
                                },
                            },
                                ...Array.from({ length: 5 }).map((_, i) =>
                                    React.createElement('div', {
                                        key: i,
                                        style: {
                                            width: '20px',
                                            height: '20px',
                                            color: i < Math.floor(merchant.rating!)
                                                ? '#fbbf24'
                                                : OG_COLORS.BORDER,
                                        }
                                    }, '★')
                                )
                            ),
                            React.createElement('span', {
                                style: { fontSize: '16px', fontWeight: '600', color: OG_COLORS.TEXT }
                            }, merchant.rating.toFixed(1))
                        )] : []),
                        ...(merchant.deliveryTime ? [React.createElement('div', {
                            style: {
                                fontSize: '16px',
                                color: OG_COLORS.TEXT_MUTED,
                            }
                        }, `🚚 ${merchant.deliveryTime} delivery`)] : [])
                    ),
                    // Call to Action
                    React.createElement('div', {
                        style: {
                            fontSize: '18px',
                            color: OG_COLORS.TEXT_MUTED,
                            marginTop: '12px',
                        }
                    }, `Order from ${merchant.businessName} on Pataupesi Delivery`)
                )
            )
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: OG_FONTS.PRIMARY,
                    data: await fetchFont('Inter-Bold'),
                    style: 'normal',
                    weight: 700,
                },
            ],
        }
    );
}

// Generate OG image for categories
export async function generateCategoryOG(
    category: {
        name: string;
        description?: string;
        imageUrl?: string;
        productCount: number;
    },
): Promise<ImageResponse> {
    return new ImageResponse(
        React.createElement('div', {
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: OG_COLORS.BACKGROUND,
                fontFamily: OG_FONTS.PRIMARY,
                position: 'relative',
            },
        },
            // Background Pattern
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 80%, ${OG_COLORS.PRIMARY}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${OG_COLORS.ACCENT}20 0%, transparent 50%)`,
                }
            }),
            // Header
            React.createElement('div', {
                style: {
                    padding: '24px 32px',
                    backgroundColor: OG_COLORS.PRIMARY,
                    color: 'white',
                    position: 'relative',
                },
            },
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center' },
                },
                    React.createElement('div', {
                        style: {
                            width: 32,
                            height: 32,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        },
                    }, 'K'),
                    React.createElement('span', {
                        style: { fontSize: '18px', fontWeight: '600' }
                    }, 'Pataupesi Delivery')
                )
            ),
            // Main Content
            React.createElement('div', {
                style: {
                    display: 'flex',
                    flex: 1,
                    padding: '48px 32px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                },
            },
                React.createElement('div', {
                    style: { maxWidth: '600px' },
                },
                    // Category Icon/Image
                    React.createElement('div', {
                        style: {
                            width: '120px',
                            height: '120px',
                            backgroundColor: `${OG_COLORS.PRIMARY}15`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            fontSize: '48px',
                            border: `3px solid ${OG_COLORS.PRIMARY}30`,
                        },
                    },
                        category.imageUrl ?
                            React.createElement('img', {
                                src: category.imageUrl,
                                alt: category.name,
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }
                            }) :
                            React.createElement('span', {}, '📂')
                    ),
                    // Category Name
                    React.createElement('div', {
                        style: {
                            fontSize: '48px',
                            fontWeight: '800',
                            color: OG_COLORS.TEXT,
                            marginBottom: '16px',
                            lineHeight: '1.1',
                        }
                    }, category.name),
                    // Description
                    ...(category.description ? [React.createElement('div', {
                        style: {
                            fontSize: '20px',
                            color: OG_COLORS.TEXT_MUTED,
                            marginBottom: '24px',
                            lineHeight: '1.4',
                        }
                    }, category.description.length > 120
                        ? `${category.description.substring(0, 120)}...`
                        : category.description)] : []),
                    // Product Count
                    React.createElement('div', {
                        style: {
                            fontSize: '24px',
                            color: OG_COLORS.PRIMARY,
                            fontWeight: '700',
                        }
                    }, `${category.productCount} Products Available`),
                    // Call to Action
                    React.createElement('div', {
                        style: {
                            fontSize: '18px',
                            color: OG_COLORS.TEXT_MUTED,
                            marginTop: '24px',
                        }
                    }, `Shop ${category.name.toLowerCase()} on Pataupesi Delivery`)
                )
            )
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: OG_FONTS.PRIMARY,
                    data: await fetchFont('Inter-Bold'),
                    style: 'normal',
                    weight: 700,
                },
            ],
        }
    );
}

// Utility function to fetch fonts
async function fetchFont(fontName: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(`https://fonts.googleapis.com/css2?family=${fontName.replace('-', '+')}:wght@400;700&display=swap`);
        const css = await response.text();

        // Extract font URL from CSS (simplified)
        const fontUrl = css.match(/url\(([^)]+)\)/)?.[1];

        if (fontUrl) {
            const fontResponse = await fetch(fontUrl);
            return fontResponse.arrayBuffer();
        }

        throw new Error('Font URL not found');
    } catch (error) {
        console.error({ message: 'Failed to fetch font:', error });
        // Return empty array buffer as fallback
        return new ArrayBuffer(0);
    }
}

// Generate OG image based on type and data
export async function generateOGImage(
    template: OGTemplate,
    data: any,
): Promise<ImageResponse> {
    switch (template) {
        case OG_TEMPLATES.PRODUCT:
            return generateProductOG(data);
        case OG_TEMPLATES.MERCHANT:
            return generateMerchantOG(data);
        case OG_TEMPLATES.CATEGORY:
            return generateCategoryOG(data);
        default:
            throw new Error(`Unsupported OG template: ${template}`);
    }
}

// API route handler for dynamic OG images
export async function handleOGImageRequest(
    request: NextRequest,
    template: OGTemplate,
    data: any
): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';

        const ogImage = await generateOGImage(template, data);

        return new Response(ogImage.body, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
            },
        });
    } catch (error) {
        console.error({ message: 'OG Image generation failed:', error });

        // Return fallback image or error response
        return new Response('OG Image generation failed', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
}