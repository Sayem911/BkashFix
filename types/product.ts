export enum ProductCategory {
  GAME_TOPUP = 'GAME_TOPUP',
  GIFT_CARD = 'GIFT_CARD',
  GAME_CURRENCY = 'GAME_CURRENCY',
  GAME_ITEMS = 'GAME_ITEMS',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum ProductPopularity {
  FEATURED = 'FEATURED',
  TRENDING = 'TRENDING',
  NEW = 'NEW',
  REGULAR = 'REGULAR'
}

export interface ICustomField {
  name: string;
  type: 'text' | 'number' | 'boolean';
  required: boolean;
  label: string;
}

export interface ISubProduct {
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity?: number;
  inStock: boolean;
}

export interface IProduct {
  _id?: string;
  title: string;
  description: string;
  guide?: string;
  guideEnabled: boolean;
  imageUrl: string;
  region: string;
  instantDelivery: boolean;
  importantNote?: string;
  customFields: ICustomField[];
  subProducts: ISubProduct[];
  isIDBased: boolean;
  idFields?: { label: string }[];
  category: ProductCategory;
  popularity: ProductPopularity;
  countryCode: string;
  displayOrder: number;
}