// Supabase数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar: string | null
          credits: number
          preferred_payment_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar?: string | null
          credits?: number
          preferred_payment_provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar?: string | null
          credits?: number
          preferred_payment_provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          amount: number
          currency: string
          product_type: string
          payment_provider: string
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          creem_checkout_id: string | null
          creem_payment_id: string | null
          status: string
          payment_details: any | null
          created_at: string
          updated_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          amount: number
          currency?: string
          product_type: string
          payment_provider: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          creem_checkout_id?: string | null
          creem_payment_id?: string | null
          status?: string
          payment_details?: any | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          amount?: number
          currency?: string
          product_type?: string
          payment_provider?: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          creem_checkout_id?: string | null
          creem_payment_id?: string | null
          status?: string
          payment_details?: any | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          video_url: string | null
          thumbnail_url: string | null
          status: string
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          creem_subscription_id: string | null
          status: string
          plan_type: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          creem_subscription_id?: string | null
          status: string
          plan_type: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          creem_subscription_id?: string | null
          status?: string
          plan_type?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

// 便捷类型别名
export type User = Database['public']['Tables']['users']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type VideoInsert = Database['public']['Tables']['videos']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type VideoUpdate = Database['public']['Tables']['videos']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'] 