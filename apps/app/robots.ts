import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/admin/",
                    "/merchant/",
                    "/driver/",
                    "/profile/",
                    "/checkout/",
                    "/cart/",
                    "/orders/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/api/",
                    "/admin/",
                    "/merchant/",
                    "/driver/",
                    "/profile/",
                    "/checkout/",
                    "/cart/",
                    "/orders/",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
