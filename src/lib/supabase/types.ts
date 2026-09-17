export type ProfileRole = "architect" | "supplier" | "admin";
export type ProfileStatus = "pending_review" | "approved" | "rejected";
export type BusinessStatus = "indicou" | "orcamento" | "fechado";
export type RatingStatus = "pending_review" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          name: string;
          phone: string;
          status: ProfileStatus;
          approved_by: string | null;
          approved_at: string | null;
          referral_token_used: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: ProfileRole;
          name: string;
          phone: string;
          status?: ProfileStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          referral_token_used?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      supplier_categories: {
        Row: { supplier_id: string; category_id: string };
        Insert: { supplier_id: string; category_id: string };
        Update: Partial<Database["public"]["Tables"]["supplier_categories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "supplier_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      referral_links: {
        Row: {
          id: string;
          token: string;
          created_by: string;
          active: boolean;
          uses_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          created_by: string;
          active?: boolean;
          uses_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["referral_links"]["Insert"]>;
        Relationships: [];
      };
      business_requests: {
        Row: {
          id: string;
          architect_id: string;
          supplier_id: string;
          category_id: string;
          status: BusinessStatus;
          title: string;
          description: string | null;
          valor_proposto: number | null;
          created_at: string;
          orcamento_at: string | null;
          fechado_at: string | null;
        };
        Insert: {
          id?: string;
          architect_id: string;
          supplier_id: string;
          category_id: string;
          status?: BusinessStatus;
          title: string;
          description?: string | null;
          valor_proposto?: number | null;
          orcamento_at?: string | null;
          fechado_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["business_requests"]["Insert"]>;
        Relationships: [];
      };
      portfolio_items: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string | null;
          link_url: string | null;
          photo_paths: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          description?: string | null;
          link_url?: string | null;
          photo_paths?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["portfolio_items"]["Insert"]>;
        Relationships: [];
      };
      business_request_attachments: {
        Row: {
          id: string;
          business_request_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_request_id: string;
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["business_request_attachments"]["Insert"]>;
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          business_request_id: string;
          architect_id: string;
          supplier_id: string;
          stars: number;
          comment: string | null;
          status: RatingStatus;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_request_id: string;
          architect_id: string;
          supplier_id: string;
          stars: number;
          comment?: string | null;
          status?: RatingStatus;
          reviewed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ratings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      profile_status: ProfileStatus;
      business_status: BusinessStatus;
      rating_status: RatingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
