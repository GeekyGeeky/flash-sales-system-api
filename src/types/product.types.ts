export interface CreateProductDto {
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  salePrice?: number;
  imageUrl?: string;
}

export interface ProductQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}
