interface ReverseGeocodeResult {
   city?: string | null;
   street?: string | null;
   country?: string | null;
   formattedAddress: string;
}

export const reverseGeocode = async (lat: number, lon: number): Promise<ReverseGeocodeResult> => {
   try {
      const response = await fetch(
         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
         {
            headers: {
               "Accept-Language": "en-US,en;q=0.9",
            },
         }
      );

      if (!response.ok) {
         throw new Error("Geocoding failed");
      }

      const data = await response.json();
      const address = data.address || {};

      const city =
         address.city ||
         address.town ||
         address.village ||
         address.county ||
         null;

      const street =
         [address.road, address.suburb, address.neighbourhood]
            .filter(Boolean)
            .join(", ") || null;

      const country = address.country || null;

      const formattedAddress = [street, city, country]
         .filter(Boolean)
         .join(", ");

      return {
         city,
         street,
         country,
         formattedAddress,
      };
   } catch (error) {
      console.error("Reverse geocoding error:", error);

      return {
         city: null,
         street: null,
         country: null,
         formattedAddress: "Unknown location",
      };
   }
};
