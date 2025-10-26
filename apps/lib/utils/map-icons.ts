export function createCustomIcon(emoji: string, color: string, label: string) {
   return `
        <div style="position: relative; width: 40px; height: 40px;">
            <!-- Marker principal -->
            <div style="
                background: linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -20)}% 100%);
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 0;
                left: 0;
            ">
                <!-- Emoji -->
                <span style="
                    font-size: 20px;
                    transform: rotate(45deg);
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                ">
                    ${emoji}
                </span>
            </div>
            
            <!-- Animation pulse -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                background-color: ${color};
                opacity: 0.3;
                animation: pulse 2s ease-in-out infinite;
            "></div>
        </div>
    `;
}

/**
 * Ajuste la luminosité d'une couleur hex
 */
function adjustBrightness(color: string, percent: number): string {
   const num = parseInt(color.replace("#", ""), 16);
   const amt = Math.round(2.55 * percent);
   const R = (num >> 16) + amt;
   const G = (num >> 8 & 0x00FF) + amt;
   const B = (num & 0x0000FF) + amt;

   return "#" + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
   ).toString(16).slice(1);
}

/**
 * Configuration des icônes pour chaque type de marker
 */
export const MAP_ICONS = {
   driver: {
      emoji: "🚗",
      color: "#3b82f6", // blue-500
      label: "Driver",
   },
   merchant: {
      emoji: "🏪",
      color: "#f59e0b", // amber-500
      label: "Merchant",
   },
   delivery: {
      emoji: "🏠",
      color: "#10b981", // green-500
      label: "Delivery",
   },
} as const;

/**
 * Configuration des couleurs de routes
 */
export const ROUTE_COLORS = {
   driverToMerchant: "#3b82f6", // blue-500
   merchantToDelivery: "#f59e0b", // amber-500
   driverToDelivery: "#10b981", // green-500
} as const;

/**
 * Ajoute les animations CSS au document
 */
export function injectMapStyles() {
   if (typeof document === 'undefined') return;

   const styleId = 'custom-map-styles';
   if (document.getElementById(styleId)) return;

   const style = document.createElement('style');
   style.id = styleId;
   style.textContent = `
        @keyframes pulse {
            0%, 100% {
                transform: rotate(-45deg) scale(1);
                opacity: 0.3;
            }
            50% {
                transform: rotate(-45deg) scale(1.1);
                opacity: 0.1;
            }
        }
        
        .custom-marker-popup .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
        }
        
        .custom-marker-popup .leaflet-popup-content {
            margin: 12px;
            font-family: system-ui, -apple-system, sans-serif;
        }
    `;
   document.head.appendChild(style);
}