import { supabase } from "@/integrations/supabase/client";

export type ChildProfile = {
  id: string;
  first_name: string;
  last_name?: string | null;
  grade?: string | null;
  birthdate?: string | null;
  avatar_url?: string | null;
};

export type ChildFormValues = {
  first_name: string;
  last_name?: string;
  grade?: string;
  birthdate?: string;
  avatar_url?: string;
};

const ACTIVE_CHILD_KEY = "lykeon.activeChildId";

export async function getMyChildren(): Promise<ChildProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("parent_children")
    .select(`
      child_profiles (
        id, first_name, last_name, grade, birthdate, avatar_url, created_at
      )
    `)
    .eq("parent_user_id", user.id)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return (data || []).map((r: any) => r.child_profiles);
}

export async function createChild(values: ChildFormValues): Promise<string> {
  const { data: childId, error } = await supabase.rpc("create_child_and_link", {
    p_first_name: values.first_name,
    p_last_name: values.last_name || null,
    p_grade: values.grade || null,
    p_birthdate: values.birthdate || null,
    p_avatar_url: values.avatar_url || null,
  });
  
  if (error) throw error;
  return childId as string;
}

export function getActiveChildId(): string | null {
  return localStorage.getItem(ACTIVE_CHILD_KEY);
}

export function setActiveChildId(childId: string) {
  localStorage.setItem(ACTIVE_CHILD_KEY, childId);
}

export async function getActiveChild(): Promise<ChildProfile | null> {
  const id = getActiveChildId();
  if (!id) return null;
  
  const { data, error } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    
  if (error) throw error;
  return data as any;
}

export async function unlinkOrDeleteChild(childId: string): Promise<"unlinked"|"deleted"> {
  const { data, error } = await supabase.rpc("unlink_or_delete_child", { p_child_id: childId });
  if (error) throw error;
  return data as "unlinked" | "deleted";
}