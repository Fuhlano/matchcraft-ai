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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      ai_generations: {
        Row: {
          created_at: string
          id: string
          input: Json | null
          kind: string
          output: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input?: Json | null
          kind: string
          output?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: Json | null
          kind?: string
          output?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      application_events: {
        Row: {
          application_id: string
          created_at: string
          detail: string | null
          event: string
          id: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          detail?: string | null
          event: string
          id?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          detail?: string | null
          event?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          contact: string | null
          created_at: string
          id: string
          job_id: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          resume_id: string | null
          sort_order: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          resume_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          resume_id?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          id: string
          issued_date: string | null
          issuer: string | null
          kind: string
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_date?: string | null
          issuer?: string | null
          kind?: string
          name?: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_date?: string | null
          issuer?: string | null
          kind?: string
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          course: string
          created_at: string
          end_date: string | null
          id: string
          institution: string
          level: string | null
          sort_order: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course?: string
          created_at?: string
          end_date?: string | null
          id?: string
          institution?: string
          level?: string | null
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course?: string
          created_at?: string
          end_date?: string | null
          id?: string
          institution?: string
          level?: string | null
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          bullets: string[]
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          role: string
          sort_order: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bullets?: string[]
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          role?: string
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bullets?: string[]
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          role?: string
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_requirements: {
        Row: {
          created_at: string
          id: string
          job_id: string
          kind: string
          label: string
          required: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          kind?: string
          label: string
          required?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          kind?: string
          label?: string
          required?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          analysis: Json | null
          analyzed_at: string | null
          area: string | null
          company: string
          created_at: string
          description: string
          id: string
          is_demo: boolean
          location: string | null
          salary: string | null
          seniority: string | null
          source: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
          work_model: string | null
        }
        Insert: {
          analysis?: Json | null
          analyzed_at?: string | null
          area?: string | null
          company?: string
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          location?: string | null
          salary?: string | null
          seniority?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id: string
          work_model?: string | null
        }
        Update: {
          analysis?: Json | null
          analyzed_at?: string | null
          area?: string | null
          company?: string
          created_at?: string
          description?: string
          id?: string
          is_demo?: boolean
          location?: string | null
          salary?: string | null
          seniority?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          work_model?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          id: string
          level: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          breakdown: Json
          created_at: string
          details: Json
          id: string
          job_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          breakdown?: Json
          created_at?: string
          details?: Json
          id?: string
          job_id: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          breakdown?: Json
          created_at?: string
          details?: Json
          id?: string
          job_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_analysis_enabled: boolean
          area: string | null
          created_at: string
          desired_role: string | null
          email: string | null
          full_name: string
          github_url: string | null
          headline: string | null
          id: string
          interests: string[]
          keep_version_history: boolean
          linkedin_url: string | null
          location: string | null
          onboarding_completed: boolean
          phone: string | null
          portfolio_url: string | null
          salary_expectation: string | null
          seniority: string | null
          summary: string | null
          updated_at: string
          work_model: string | null
        }
        Insert: {
          ai_analysis_enabled?: boolean
          area?: string | null
          created_at?: string
          desired_role?: string | null
          email?: string | null
          full_name?: string
          github_url?: string | null
          headline?: string | null
          id: string
          interests?: string[]
          keep_version_history?: boolean
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          portfolio_url?: string | null
          salary_expectation?: string | null
          seniority?: string | null
          summary?: string | null
          updated_at?: string
          work_model?: string | null
        }
        Update: {
          ai_analysis_enabled?: boolean
          area?: string | null
          created_at?: string
          desired_role?: string | null
          email?: string | null
          full_name?: string
          github_url?: string | null
          headline?: string | null
          id?: string
          interests?: string[]
          keep_version_history?: boolean
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          portfolio_url?: string | null
          salary_expectation?: string | null
          seniority?: string | null
          summary?: string | null
          updated_at?: string
          work_model?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          tech: string[]
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          tech?: string[]
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          tech?: string[]
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          ats_score: number
          content: Json
          created_at: string
          id: string
          note: string | null
          resume_id: string
          user_id: string
          version: number
        }
        Insert: {
          ats_score?: number
          content?: Json
          created_at?: string
          id?: string
          note?: string | null
          resume_id: string
          user_id: string
          version?: number
        }
        Update: {
          ats_score?: number
          content?: Json
          created_at?: string
          id?: string
          note?: string | null
          resume_id?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_breakdown: Json
          ats_score: number
          company: string | null
          content: Json
          created_at: string
          id: string
          job_id: string | null
          template: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_breakdown?: Json
          ats_score?: number
          company?: string | null
          content?: Json
          created_at?: string
          id?: string
          job_id?: string | null
          template?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_breakdown?: Json
          ats_score?: number
          company?: string | null
          content?: Json
          created_at?: string
          id?: string
          job_id?: string | null
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          level: string | null
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          level?: string | null
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
