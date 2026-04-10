"use client";

import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    category: string;
    imageUrl?: string;
    tags?: string[];
    inStock?: boolean;
    stockLevel?: number;
    promotion?: { label: string; endDate?: string; discountPercent?: number };
  };
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = product.imageUrl && product.imageUrl !== "" && !imgError;

  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const isLowStock =
    product.stockLevel !== undefined && product.stockLevel > 0 && product.stockLevel < 5;
  const hasSale = product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            {initials}
          </div>
        )}
        {hasSale && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
            {product.promotion?.discountPercent
              ? `-${product.promotion.discountPercent}%`
              : "SALE"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate">
            {product.name}
          </h4>
          <div className="flex-shrink-0 text-right">
            {hasSale ? (
              <>
                <span className="font-bold text-sm text-red-600">
                  &euro;{product.salePrice!.toFixed(2).replace(".", ",")}
                </span>
                <span className="block text-[10px] text-gray-400 line-through">
                  &euro;{product.price.toFixed(2).replace(".", ",")}
                </span>
              </>
            ) : (
              <span
                className="font-bold text-sm"
                style={{ color: "var(--tenant-primary)" }}
              >
                &euro;{product.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {product.description}
        </p>

        {product.promotion?.label && (
          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {product.promotion.label}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {product.category}
            </span>
            {isLowStock && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                Nog {product.stockLevel} op voorraad
              </span>
            )}
          </div>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product.id)}
              className="text-xs font-medium px-3 py-1 rounded-lg text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              + Toevoegen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductListProps {
  products: ProductCardProps["product"][];
  onAddToCart?: (productId: string) => void;
}

export function ProductList({ products, onAddToCart }: ProductListProps) {
  if (!products || products.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
