export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          id: string
          profile_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tokens_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          id: string
          profile_id: string
          amount: number
          transaction_type: string
          description: string
          payment_id: string | null
          event_id: string | null
          song_id: string | null
          created_at: string
        }
        Insert: {
          profile_id: string
          amount: number
          transaction_type: string
          description: string
          payment_id?: string | null
          event_id?: string | null
          song_id?: string | null
          created_at?: string
        }
        Update: {
          profile_id?: string
          amount?: number
          transaction_type?: string
          description?: string
          payment_id?: string | null
          event_id?: string | null
          song_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          venue: string
          address: string | null
          event_date: string
          end_time: string | null
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          venue: string
          address?: string | null
          event_date: string
          end_time?: string | null
          image_url?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          venue?: string
          address?: string | null
          event_date?: string
          end_time?: string | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          profile_id: string
          event_id: string
          ticket_type: string
          ticket_code: string
          purchase_date: string
          payment_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          event_id: string
          ticket_type: string
          ticket_code: string
          purchase_date: string
          payment_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          event_id?: string
          ticket_type?: string
          ticket_code?: string
          purchase_date?: string
          payment_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_requests: {
        Row: {
          id: string
          event_id: string
          profile_id: string
          title: string
          artist: string
          album_art: string | null
          tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          event_id: string
          profile_id: string
          title: string
          artist: string
          album_art?: string | null
          tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_id?: string
          profile_id?: string
          title?: string
          artist?: string
          album_art?: string | null
          tokens?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_bids: {
        Row: {
          id: string
          song_request_id: string
          profile_id: string
          tokens: number
          created_at: string
        }
        Insert: {
          song_request_id: string
          profile_id: string
          tokens: number
          created_at?: string
        }
        Update: {
          song_request_id?: string
          profile_id?: string
          tokens?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_bids_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_bids_song_request_id_fkey"
            columns: ["song_request_id"]
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
        ]
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
