//////////////////////////////////////////////////////////
// NEXTAUTH MODELS
//////////////////////////////////////////////////////////

export interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null

  user?: Profile
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  user?: Profile
}

export interface VerificationToken {
  identifier: string
  token: string
  expires: Date
}

//////////////////////////////////////////////////////////
// PROFILE (USUARIO PRINCIPAL)
//////////////////////////////////////////////////////////

export interface Profile {
  id: string
  full_name?: string | null
  status: string
  email: string
  password?: string | null
  avatar_url?: string | null
  is_admin?: boolean
  is_approved?: boolean
  role: string
  emailVerified?: Date | null
  created_at: Date
  updated_at?: Date

  accounts?: Account[]
  sessions?: Session[]
  carts?: Cart[]
  orders?: Order[]
  reviews?: Review[]
  couponUsages?: CouponUsage[]
}

//////////////////////////////////////////////////////////
// PRODUCTOS
//////////////////////////////////////////////////////////

export interface Product {
  id: string
  name: string
  description: string
  price_in_cents: number
  image_url?: string | null
  category?: string | null
  available: boolean
  created_at: Date
  updated_at: Date

  cart_items?: CartItem[]
  order_items?: OrderItem[]
  reviews?: Review[]
}

//////////////////////////////////////////////////////////
// CUPONES
//////////////////////////////////////////////////////////

export interface Coupon {
  id: string
  code: string
  hash: string
  description?: string | null
  expires_at?: Date | null
  discount: number
  valid_until?: Date | null
  active: boolean
  new_user_only: boolean
  created_at: Date
  updated_at: Date
  maxUses?: number | null
  usedCount: number

  _count?:{
    used_by: number
  }

  used_by?: CouponUsage[]
  orders?: Order[]
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  used_at: Date

  coupon?: Coupon
  user?: Profile
}

//////////////////////////////////////////////////////////
// PAGOS
//////////////////////////////////////////////////////////

export interface Payment {
  id: string
  order_id: string
  card_holder: string
  card_number: string
  expiration: string
  cvv: string
  status: string
  created_at: Date

  order?: Order
}

//////////////////////////////////////////////////////////
// CARRITOS
//////////////////////////////////////////////////////////

export interface Cart {
  id: string
  user_id: string
  created_at: Date
  updated_at: Date

  user?: Profile
  cart_items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  created_at: Date
  updated_at: Date

  cart?: Cart
  product?: Product
}

//////////////////////////////////////////////////////////
// ÓRDENES
//////////////////////////////////////////////////////////

export interface Order {
  id: string
  user_id: string
  total_amount_in_cents: number
  status: string
  stripe_payment_intent_id?: string | null
  created_at: Date
  updated_at: Date

  user?: Profile
  order_items?: OrderItem[]
  payments?: Payment[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string | null
  product_name: string
  product_price_in_cents: number
  quantity: number
  created_at: Date

  order?: Order
  product?: Product
}

//////////////////////////////////////////////////////////
// RESEÑAS
//////////////////////////////////////////////////////////

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment?: string | null
  created_at: Date
  updated_at: Date

  product?: Product
  user?: Profile
}
