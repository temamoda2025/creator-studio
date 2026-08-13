import { supabase } from "./supabase";

export interface CustomTemplate {
  id: string;
  name: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export async function listCustomTemplates(brandId: string): Promise<CustomTemplate[]> {
  const { data, error } = await supabase
    .from("custom_templates")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    config: row.config ?? {},
    createdAt: row.created_at,
  }));
}

export async function saveCustomTemplate(
  brandId: string,
  name: string,
  config: Record<string, unknown>
): Promise<CustomTemplate | null> {
  const { data, error } = await supabase
    .from("custom_templates")
    .insert({ brand_id: brandId, name, config })
    .select()
    .single();

  if (error || !data) return null;

  return { id: data.id, name: data.name, config: data.config ?? {}, createdAt: data.created_at };
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  await supabase.from("custom_templates").delete().eq("id", id);
}
