export interface MenuItem {
  title: string
  description: string
  price: string
  menu_price: string
  category: string
}

export interface CartItem {
  key: string
  name: string
  price: number
  qty: number
}

export interface CustomizerState {
  name: string
  price: number
  menuPrice: number
  hasSauce: boolean
  hasCrudites: boolean
}

export interface Review {
  quote: string
  author: string
  stars: number
}
