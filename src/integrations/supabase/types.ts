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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          kind: string
          link_label: string | null
          link_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          link_label?: string | null
          link_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          link_label?: string | null
          link_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      attempt_answers: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean
          part_id: string | null
          question_id: string
          selected_option_id: string | null
          written_answer: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean
          part_id?: string | null
          question_id: string
          selected_option_id?: string | null
          written_answer?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          part_id?: string | null
          question_id?: string
          selected_option_id?: string | null
          written_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "creative_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      creative_parts: {
        Row: {
          id: string
          marks: number
          model_answer: string | null
          part_key: string
          question_id: string
          question_text: string
        }
        Insert: {
          id?: string
          marks?: number
          model_answer?: string | null
          part_key: string
          question_id: string
          question_text: string
        }
        Update: {
          id?: string
          marks?: number
          model_answer?: string | null
          part_key?: string
          question_id?: string
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_parts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          activity_date: string
          id: string
          lessons_completed: number
          points: number
          questions_answered: number
          user_id: string
        }
        Insert: {
          activity_date?: string
          id?: string
          lessons_completed?: number
          points?: number
          questions_answered?: number
          user_id: string
        }
        Update: {
          activity_date?: string
          id?: string
          lessons_completed?: number
          points?: number
          questions_answered?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          finished_at: string | null
          folder_id: string | null
          id: string
          question_ids: string[] | null
          score: number
          started_at: string
          total: number
          user_id: string
        }
        Insert: {
          finished_at?: string | null
          folder_id?: string | null
          id?: string
          question_ids?: string[] | null
          score?: number
          started_at?: string
          total?: number
          user_id: string
        }
        Update: {
          finished_at?: string | null
          folder_id?: string | null
          id?: string
          question_ids?: string[] | null
          score?: number
          started_at?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "exam_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_folders: {
        Row: {
          created_at: string
          id: string
          is_free: boolean
          is_published: boolean
          is_system: boolean
          parent_id: string | null
          root_key: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          is_system?: boolean
          parent_id?: string | null
          root_key?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          is_system?: boolean
          parent_id?: string | null
          root_key?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "exam_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_groups: {
        Row: {
          created_at: string
          description: string | null
          free_lesson_limit: number
          id: string
          is_published: boolean
          section: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          free_lesson_limit?: number
          id?: string
          is_published?: boolean
          section?: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          free_lesson_limit?: number
          id?: string
          is_published?: boolean
          section?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          is_published: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          group_id: string
          id?: string
          is_published?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_published?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "lesson_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          theme_pref: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          theme_pref?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          theme_pref?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          order_index?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          explanation: string | null
          folder_id: string
          id: string
          image_url: string | null
          question_text: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          folder_id: string
          id?: string
          image_url?: string | null
          question_text: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          folder_id?: string
          id?: string
          image_url?: string | null
          question_text?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "exam_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          kind: string
          message: string
          question_id: string | null
          replied_at: string | null
          reply_seen_by_student: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          kind?: string
          message: string
          question_id?: string | null
          replied_at?: string | null
          reply_seen_by_student?: boolean
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string
          question_id?: string | null
          replied_at?: string | null
          reply_seen_by_student?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_mistakes: {
        Row: {
          id: string
          is_resolved: boolean
          last_wrong_at: string
          question_id: string
          resolved_at: string | null
          times_wrong: number
          user_id: string
        }
        Insert: {
          id?: string
          is_resolved?: boolean
          last_wrong_at?: string
          question_id: string
          resolved_at?: string | null
          times_wrong?: number
          user_id: string
        }
        Update: {
          id?: string
          is_resolved?: boolean
          last_wrong_at?: string
          question_id?: string
          resolved_at?: string | null
          times_wrong?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_mistakes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_mistakes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_by: string | null
          created_at: string
          expires_at: string
          id: string
          payment_method: string | null
          payment_note: string | null
          plan_id: string | null
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_by?: string | null
          created_at?: string
          expires_at: string
          id?: string
          payment_method?: string | null
          payment_note?: string | null
          plan_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          payment_method?: string | null
          payment_note?: string | null
          plan_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vocab_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      vocab_words: {
        Row: {
          arabic: string
          created_at: string
          id: string
          meaning_bn: string
          order_index: number
          pronunciation_bn: string | null
          updated_at: string
          vocab_topic_id: string
        }
        Insert: {
          arabic: string
          created_at?: string
          id?: string
          meaning_bn: string
          order_index?: number
          pronunciation_bn?: string | null
          updated_at?: string
          vocab_topic_id: string
        }
        Update: {
          arabic?: string
          created_at?: string
          id?: string
          meaning_bn?: string
          order_index?: number
          pronunciation_bn?: string | null
          updated_at?: string
          vocab_topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocab_words_vocab_topic_id_fkey"
            columns: ["vocab_topic_id"]
            isOneToOne: false
            referencedRelation: "vocab_topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _grade: {
        Args: {
          p_option_id: string
          p_part_id: string
          p_question_id: string
          p_self_correct: boolean
        }
        Returns: Record<string, unknown>
      }
      _track: {
        Args: {
          ok: boolean
          p_question_id: string
          practice: boolean
          pts: number
          uid: string
        }
        Returns: undefined
      }
      admin_active_per_day: {
        Args: { p_days: number }
        Returns: {
          count: number
          day: string
        }[]
      }
      admin_cancel_subscription: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      admin_dashboard_stats: { Args: never; Returns: Json }
      admin_save_questions: {
        Args: { p_folder_id: string; p_questions: Json }
        Returns: undefined
      }
      admin_set_folder_free: {
        Args: { p_folder_id: string; p_is_free: boolean; p_recursive?: boolean }
        Returns: undefined
      }
      admin_set_subscription: {
        Args: {
          p_email: string
          p_note: string
          p_payment_method: string
          p_plan_id: string
        }
        Returns: {
          activated_by: string | null
          created_at: string
          expires_at: string
          id: string
          payment_method: string | null
          payment_note: string | null
          plan_id: string | null
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_signups_per_day: {
        Args: { p_days: number }
        Returns: {
          count: number
          day: string
        }[]
      }
      answer_question: {
        Args: {
          p_attempt_id: string
          p_option_id?: string
          p_part_id?: string
          p_question_id: string
          p_self_correct?: boolean
        }
        Returns: boolean
      }
      can_access_folder: {
        Args: { _folder_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_lesson: {
        Args: { _lesson_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_vocab_topic: {
        Args: { _topic_id: string; _user_id: string }
        Returns: boolean
      }
      complete_lesson: { Args: { p_lesson_id: string }; Returns: undefined }
      dhaka_today: { Args: never; Returns: string }
      finish_exam: { Args: { p_attempt_id: string }; Returns: undefined }
      folder_root_key: { Args: { _folder_id: string }; Returns: string }
      get_group_lessons: {
        Args: { p_group_id: string }
        Returns: {
          id: string
          is_completed: boolean
          is_locked: boolean
          lesson_position: number
          order_index: number
          title: string
        }[]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      practice_mistake: {
        Args: {
          p_option_id?: string
          p_part_id?: string
          p_question_id: string
          p_self_correct?: boolean
        }
        Returns: boolean
      }
      start_exam:
        | { Args: { p_folder_id: string }; Returns: string }
        | {
            Args: { p_folder_id: string; p_question_ids: string[] }
            Returns: string
          }
      touch_last_seen: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "student"],
    },
  },
} as const
