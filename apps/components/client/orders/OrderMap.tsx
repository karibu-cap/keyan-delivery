"use client"

import { useEffect, useRef, useState } from "react"

interface OrderMapProps {
    deliveryLocation?: [number, number]
    driverLocation?: [number, number]
    merchantName: string
}

export default function OrderMap({
    deliveryLocation,
    driverLocation,
    merchantName,
}: OrderMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const mapInstanceRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    useEffect(() => {
        // Load Leaflet dynamically
        if (typeof window !== "undefined" && !mapLoaded) {
            import("leaflet").then((L) => {
                setMapLoaded(true)

                // Initialize map
                if (mapRef.current && !mapInstanceRef.current) {
                    const defaultCenter: [number, number] = deliveryLocation || [3.848, 11.5021]

                    const map = L.map(mapRef.current).setView(defaultCenter, 13)

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        maxZoom: 19,
                    }).addTo(map)

                    mapInstanceRef.current = map

                    // Add delivery location marker
                    if (deliveryLocation) {
                        const deliveryIcon = L.divIcon({
                            className: "custom-marker",
                            html: `
                <div style="
                  background-color: #0aad0a;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
              `,
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                        })

                        const marker = L.marker(deliveryLocation, { icon: deliveryIcon })
                            .addTo(map)
                            .bindPopup("<b>Delivery Address</b>")

                        markersRef.current.push(marker)
                    }

                    // Add driver location marker
                    if (driverLocation) {
                        const driverIcon = L.divIcon({
                            className: "custom-marker",
                            html: `
                <div style="
                  background-color: #2563eb;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  animation: pulse 2s infinite;
                ">
                  <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
              `,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                        })

                        const marker = L.marker(driverLocation, { icon: driverIcon })
                            .addTo(map)
                            .bindPopup("<b>Driver Location</b>")

                        markersRef.current.push(marker)

                        // Draw route line if both locations exist
                        if (deliveryLocation) {
                            const routeLine = L.polyline([driverLocation, deliveryLocation], {
                                color: "#0aad0a",
                                weight: 4,
                                opacity: 0.7,
                                dashArray: "10, 10",
                            }).addTo(map)

                            markersRef.current.push(routeLine)

                            // Fit bounds to show both markers
                            map.fitBounds([driverLocation, deliveryLocation], { padding: [50, 50] })
                        }
                    }
                }
            })

            // Load Leaflet CSS
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            document.head.appendChild(link)

            // Add pulse animation
            const style = document.createElement("style")
            style.textContent = `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
      `
            document.head.appendChild(style)
        }

        return () => {
            // Cleanup markers
            if (mapInstanceRef.current) {
                markersRef.current.forEach((marker) => {
                    if (marker.remove) marker.remove()
                })
                markersRef.current = []
            }
        }
    }, [deliveryLocation, driverLocation, mapLoaded, merchantName])

    // Update driver location when it changes
    useEffect(() => {
        if (mapInstanceRef.current && driverLocation && mapLoaded) {
            // Remove old markers
            markersRef.current.forEach((marker) => {
                if (marker.remove) marker.remove()
            })
            markersRef.current = []

            // Re-add markers with updated location
            import("leaflet").then((L) => {
                const map = mapInstanceRef.current

                // Add delivery marker
                if (deliveryLocation) {
                    const deliveryIcon = L.divIcon({
                        className: "custom-marker",
                        html: `
              <div style="
                background-color: #0aad0a;
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
            `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                    })

                    const marker = L.marker(deliveryLocation, { icon: deliveryIcon })
                        .addTo(map)
                        .bindPopup("<b>Delivery Address</b>")

                    markersRef.current.push(marker)
                }

                // Add driver marker
                const driverIcon = L.divIcon({
                    className: "custom-marker",
                    html: `
            <div style="
              background-color: #2563eb;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              animation: pulse 2s infinite;
            ">
              <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                })

                const marker = L.marker(driverLocation, { icon: driverIcon })
                    .addTo(map)
                    .bindPopup("<b>Driver Location</b>")

                markersRef.current.push(marker)

                // Draw route line
                if (deliveryLocation) {
                    const routeLine = L.polyline([driverLocation, deliveryLocation], {
                        color: "#0aad0a",
                        weight: 4,
                        opacity: 0.7,
                        dashArray: "10, 10",
                    }).addTo(map)

                    markersRef.current.push(routeLine)
                }
            })
        }
    }, [driverLocation, deliveryLocation, mapLoaded])

    return <div ref={mapRef} className="h-[400px] w-full rounded-lg" />
}