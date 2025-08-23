export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      child_profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          created_at: string | null
          first_name: string
          grade: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name: string
          grade?: string | null
          id?: string
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          first_name?: string
          grade?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          date_time: string
          duration: number
          grade: string
          id: string
          materials: Json | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_time: string
          duration?: number
          grade: string
          id?: string
          materials?: Json | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_time?: string
          duration?: number
          grade?: string
          id?: string
          materials?: Json | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_push: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson_id: string
          max_score: number
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          lesson_id: string
          max_score?: number
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson_id?: string
          max_score?: number
          title?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      gam_badges: {
        Row: {
          category: string
          id: string
          name: string
          rarity: Database["public"]["Enums"]["badge_rarity"]
        }
        Insert: {
          category: string
          id?: string
          name: string
          rarity?: Database["public"]["Enums"]["badge_rarity"]
        }
        Update: {
          category?: string
          id?: string
          name?: string
          rarity?: Database["public"]["Enums"]["badge_rarity"]
        }
        Relationships: []
      }
      gam_focus: {
        Row: {
          max: number
          remaining: number
          user_id: string
        }
        Insert: {
          max?: number
          remaining?: number
          user_id: string
        }
        Update: {
          max?: number
          remaining?: number
          user_id?: string
        }
        Relationships: []
      }
      gam_levels: {
        Row: {
          level: number
          required_xp: number
        }
        Insert: {
          level: number
          required_xp: number
        }
        Update: {
          level?: number
          required_xp?: number
        }
        Relationships: []
      }
      gam_missions: {
        Row: {
          description: string | null
          enabled: boolean
          id: string
          name: string
          period: Database["public"]["Enums"]["mission_period"]
          reward_lumis: number
          reward_xp: number
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          period: Database["public"]["Enums"]["mission_period"]
          reward_lumis?: number
          reward_xp?: number
        }
        Update: {
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          period?: Database["public"]["Enums"]["mission_period"]
          reward_lumis?: number
          reward_xp?: number
        }
        Relationships: []
      }
      gam_profiles: {
        Row: {
          created_at: string | null
          grade: string | null
          student_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grade?: string | null
          student_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          grade?: string | null
          student_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gam_streaks: {
        Row: {
          best: number
          current: number
          protected_days: number
          user_id: string
        }
        Insert: {
          best?: number
          current?: number
          protected_days?: number
          user_id: string
        }
        Update: {
          best?: number
          current?: number
          protected_days?: number
          user_id?: string
        }
        Relationships: []
      }
      gam_user_badges: {
        Row: {
          badge_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gam_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "gam_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      gam_user_missions: {
        Row: {
          mission_id: string
          progress: number
          resets_at: string
          status: Database["public"]["Enums"]["mission_status"]
          user_id: string
        }
        Insert: {
          mission_id: string
          progress?: number
          resets_at: string
          status?: Database["public"]["Enums"]["mission_status"]
          user_id: string
        }
        Update: {
          mission_id?: string
          progress?: number
          resets_at?: string
          status?: Database["public"]["Enums"]["mission_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gam_user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "gam_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      gam_wallets: {
        Row: {
          lumis: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          lumis?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          lumis?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gam_xp: {
        Row: {
          current_xp: number
          level: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_xp?: number
          level?: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_xp?: number
          level?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          class_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["lesson_status"]
          title: string
          transcript: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          title: string
          transcript?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          title?: string
          transcript?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_user_id: string
          id: string
          is_read: boolean
          to_user_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          from_user_id: string
          id?: string
          is_read?: boolean
          to_user_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          from_user_id?: string
          id?: string
          is_read?: boolean
          to_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notif_prefs: {
        Row: {
          email: boolean | null
          in_app: boolean | null
          push: boolean | null
          quiet_end: string | null
          quiet_start: string | null
          sms: boolean | null
          type_key: string
          user_id: string
        }
        Insert: {
          email?: boolean | null
          in_app?: boolean | null
          push?: boolean | null
          quiet_end?: string | null
          quiet_start?: string | null
          sms?: boolean | null
          type_key: string
          user_id: string
        }
        Update: {
          email?: boolean | null
          in_app?: boolean | null
          push?: boolean | null
          quiet_end?: string | null
          quiet_start?: string | null
          sms?: boolean | null
          type_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notif_prefs_type_key_fkey"
            columns: ["type_key"]
            isOneToOne: false
            referencedRelation: "notif_types"
            referencedColumns: ["key"]
          },
        ]
      }
      notif_types: {
        Row: {
          default_channels: Json
          id: string
          key: string
        }
        Insert: {
          default_channels?: Json
          id?: string
          key: string
        }
        Update: {
          default_channels?: Json
          id?: string
          key?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          data_json: Json | null
          delivered_at: string | null
          id: string
          read_at: string | null
          title: string
          type_key: string
          user_id: string
        }
        Insert: {
          body?: string | null
          data_json?: Json | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          title: string
          type_key: string
          user_id: string
        }
        Update: {
          body?: string | null
          data_json?: Json | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_type_key_fkey"
            columns: ["type_key"]
            isOneToOne: false
            referencedRelation: "notif_types"
            referencedColumns: ["key"]
          },
        ]
      }
      parent_children: {
        Row: {
          child_id: string
          created_at: string | null
          parent_user_id: string
          relationship: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          parent_user_id: string
          relationship?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          parent_user_id?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          language: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          language?: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limiting: {
        Row: {
          action_type: string
          attempts_count: number | null
          id: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempts_count?: number | null
          id?: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempts_count?: number | null
          id?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          age: number
          created_at: string
          grade: string
          id: string
          language: Database["public"]["Enums"]["language_preference"]
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          age: number
          created_at?: string
          grade: string
          id?: string
          language?: Database["public"]["Enums"]["language_preference"]
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          age?: number
          created_at?: string
          grade?: string
          id?: string
          language?: Database["public"]["Enums"]["language_preference"]
          name?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          plan: string
          renewal_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          plan?: string
          renewal_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          plan?: string
          renewal_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_attachments: {
        Row: {
          created_at: string | null
          file_url: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_mission: {
        Args: { p_mission: string; p_user: string }
        Returns: {
          new_current_xp: number
          new_level: number
          new_lumis: number
          new_next_req: number
        }[]
      }
      create_child_and_link: {
        Args: {
          p_avatar_url?: string
          p_birthdate?: string
          p_first_name: string
          p_grade?: string
          p_last_name?: string
        }
        Returns: string
      }
      insert_notification: {
        Args: {
          p_body: string
          p_data: Json
          p_title: string
          p_type: string
          p_user: string
        }
        Returns: string
      }
      log_security_event: {
        Args: { p_event_data?: Json; p_event_type: string }
        Returns: string
      }
      mark_all_read: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      badge_rarity: "common" | "rare" | "legendary" | "seasonal"
      exercise_type: "quiz" | "upload"
      language_preference: "pt-br" | "fr" | "en"
      lesson_status: "not_started" | "in_progress" | "completed"
      mission_period: "daily" | "weekly"
      mission_status: "locked" | "active" | "completed" | "claimed"
      subscription_status: "active" | "inactive" | "trial" | "expired"
      user_role: "parent" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_rarity: ["common", "rare", "legendary", "seasonal"],
      exercise_type: ["quiz", "upload"],
      language_preference: ["pt-br", "fr", "en"],
      lesson_status: ["not_started", "in_progress", "completed"],
      mission_period: ["daily", "weekly"],
      mission_status: ["locked", "active", "completed", "claimed"],
      subscription_status: ["active", "inactive", "trial", "expired"],
      user_role: ["parent", "student"],
    },
  },
} as const
