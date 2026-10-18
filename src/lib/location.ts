export interface DetectedAddress {
  area: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export async function detectUserAddress(): Promise<DetectedAddress> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // zoom=18 forces OSM to resolve to the closest road/building level rather than an administrative sector
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          );
          const data = await res.json();

          if (!data || !data.address) {
            throw new Error("Could not detect address details.");
          }

          const addr = data.address;

          // 1. PIN code
          const pincode = (addr.postcode || "").replace(/\D/g, "").slice(0, 6);

          // 2. Prioritize hyper-local tags over broad zones
          const road = addr.road || addr.pedestrian || "";

          // Check micro-localities first (e.g. Zakir Nagar, Batla House, Ghaffar Manzil)
          const microLocality =
            addr.residential ||
            addr.neighbourhood ||
            addr.quarter ||
            addr.suburb ||
            "";

          // City / District fallback
          const city =
            addr.city ||
            addr.town ||
            addr.city_district ||
            addr.county ||
            "South Delhi";

          const state = addr.state || "Delhi";

          // If the parsed road/microLocality is too generic or overlaps, extract tokens from display_name
          let area = [road, microLocality].filter(Boolean).join(", ");

          if (!area && data.display_name) {
            // Take the first 2 parts of the readable address as the immediate area
            const parts = data.display_name
              .split(",")
              .map((p: string) => p.trim());
            area = parts.slice(0, 2).join(", ");
          }

          resolve({
            area: area || microLocality,
            address: area || microLocality,
            city,
            state,
            pincode,
          });
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error("Location permission denied. Please enter manually."),
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error("Position unavailable. Please enter address manually."),
          );
        } else {
          reject(new Error("Unable to acquire device location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // Never use cached coordinates
      },
    );
  });
}
