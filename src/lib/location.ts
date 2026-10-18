export interface DetectedAddress {
  area: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export async function detectUserAddress(): Promise<DetectedAddress> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Request reverse geocoding with explicit accept-language for Indian addresses
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            },
          );

          if (!res.ok) {
            throw new Error(
              "Unable to retrieve location details from map provider.",
            );
          }

          const data = await res.json();

          if (!data || !data.address) {
            throw new Error("Could not detect address details.");
          }

          const addr = data.address;

          // 1. PIN code (strictly 6 digits if available)
          const rawPostcode = (addr.postcode || "").replace(/\D/g, "");
          const pincode =
            rawPostcode.length >= 6 ? rawPostcode.slice(0, 6) : rawPostcode;

          // 2. Micro-locality & Street details
          const road = addr.road || addr.pedestrian || addr.street || "";
          const microLocality =
            addr.residential ||
            addr.neighbourhood ||
            addr.suburb ||
            addr.quarter ||
            addr.city_district ||
            "";

          // 3. True City / District resolution (dynamic, no hardcoded state/city fallbacks)
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.district ||
            addr.county ||
            "";

          const state = addr.state || "";

          // 4. Clean Area String Construction
          const areaParts = [road, microLocality].filter(Boolean);
          let area = areaParts.join(", ");

          if (!area && data.display_name) {
            const parts = data.display_name
              .split(",")
              .map((p: string) => p.trim());
            area = parts.slice(0, 2).join(", ");
          }

          resolve({
            area: area || city,
            address: area || "",
            city,
            state,
            pincode,
          });
        } catch (err) {
          reject(
            err instanceof Error
              ? err
              : new Error(
                  "Failed to auto-detect your address. Please fill manually.",
                ),
          );
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission denied. Please enter address manually.",
            ),
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error("Position unavailable. Please enter address manually."),
          );
        } else {
          reject(
            new Error(
              "Unable to acquire device location. Please enter manually.",
            ),
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}
