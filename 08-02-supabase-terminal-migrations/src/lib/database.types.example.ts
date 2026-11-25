// Offline starter shape for src/lib/database.types.ts
// Replace with live cloud types via: npm run db:types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      feedback_items: {
        Row: {
          created_at: string;
          id: string;
          title: string;
          user_id: string;
          votes: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          title: string;
          user_id: string;
          votes?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          title?: string;
          user_id?: string;
          votes?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
