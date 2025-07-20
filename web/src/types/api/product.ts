export type Product = {
  id: string;
  code: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  full_price: number;
  selling_price: number;
  cost: number;
  shipping_fee: number;
  note?: string;
  keyword?: string;
  product_category?: string;
  product_type?: string;
  color?: string;
  size?: string;
  weight: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};

export type ProductCreate = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;

export type ProductResponse = Product;
