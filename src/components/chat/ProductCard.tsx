"use client";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    tags?: string[];
  };
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div
        className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: "var(--tenant-primary)" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate">
            {product.name}
          </h4>
          <span className="flex-shrink-0 font-bold text-sm" style={{ color: "var(--tenant-primary)" }}>
            &euro;{product.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {product.category}
          </span>
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
