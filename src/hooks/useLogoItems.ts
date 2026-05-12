import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { LogoItem } from "@/types/logo";
import { getLogoUrl } from "@/lib/logo";

interface UseLogoItemsOptions {
  category?: string;
  preload?: boolean;
}

interface UseLogoItemsResult {
  logoItems: LogoItem[];
  isLoading: boolean;
  error: Error | null;
}

export const useLogoItems = ({
  category = "airline",
  preload = true,
}: UseLogoItemsOptions = {}): UseLogoItemsResult => {
  const { toast } = useToast();
  const [logoItems, setLogoItems] = useState<LogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("logo_items")
          .select("id,name,logo_image_url,updated_at,category,is_active,created_at")
          .eq("is_active", true)
          .eq("category", category);

        if (cancelled) return;
        if (queryError) throw queryError;

        setLogoItems(data ?? []);
      } catch (err) {
        if (cancelled) return;
        const e = err instanceof Error ? err : new Error("Failed to load logos");
        console.error("Error fetching logos:", e);
        setError(e);
        toast({
          title: "Error loading logos",
          description: "Could not load airline logos. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, toast]);

  // Preload all images for smooth transitions
  useEffect(() => {
    if (!preload) return;
    logoItems.forEach((item) => {
      const img = new Image();
      img.src = getLogoUrl(item);
    });
  }, [logoItems, preload]);

  return { logoItems, isLoading, error };
};
