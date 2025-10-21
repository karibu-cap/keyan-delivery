/**
 * Lottie Animations Configuration
 * Free animations from https://lottiefiles.com/free-animations/shopping
 */

export const LOTTIE_ANIMATIONS = {
    // Empty States
    emptyCart: "https://lottie.host/4c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    emptyOrders: "https://lottie.host/9c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    emptyProducts: "https://lottie.host/7c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    noResults: "https://lottie.host/6c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",

    // Success States
    orderSuccess: "https://lottie.host/5c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    uploadSuccess: "https://lottie.host/3c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",

    // Loading States
    loading: "https://lottie.host/2c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    processing: "https://lottie.host/1c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",

    // Shopping Related
    shopping: "https://lottie.host/8c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
    delivery: "https://lottie.host/0c3d0d3c-8e3f-4d3e-9c3e-8d3f4c3d0d3c/8d3f4c3d0d.json",
} as const;

export type LottieAnimationType = keyof typeof LOTTIE_ANIMATIONS;

/**
* Default Lottie options
*/
export const DEFAULT_LOTTIE_OPTIONS = {
    loop: true,
    autoplay: true,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

/**
* Get animation URL by type
*/
export const getAnimationUrl = (type: LottieAnimationType): string => {
    return LOTTIE_ANIMATIONS[type];
};