import type { Database } from "@/integrations/supabase/types";

export type LogoItem = Database["public"]["Tables"]["logo_items"]["Row"];
