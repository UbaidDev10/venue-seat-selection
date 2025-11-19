import { useState, useEffect } from "react";
import type { Venue } from "../types";

export const useVenue = () => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenue = async () => {
      try {
        // Check if venue-generated.json exists, otherwise use venue.json
        let response = await fetch("/venue-generated.json");
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!isJson || !response.ok) {
          response = await fetch("/venue.json");
        }

        if (!response.ok) {
          throw new Error("Failed to load venue data");
        }

        const data: Venue = await response.json();
        setVenue(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, []);

  return { venue, loading, error, setVenue };
};

