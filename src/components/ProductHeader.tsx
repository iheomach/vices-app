// components/ProductHeader.tsx
import React from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'cannabis' | 'alcohol';
  type: string;
  thc_content?: number;
  cbd_content?: number;
  alcohol_content?: number;
  price: number;
  image: string;
  description: string;
  effects: string[];
  terpenes?: string[];
  strain_type?: 'indica' | 'sativa' | 'hybrid';
  volume?: string;
  rating: number;
  review_count: number;
  lab_tested: boolean;
  organic: boolean;
  in_stock: boolean;
}

interface ProductHeaderProps {
  product: Product;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl'
    };
    
    return (
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="text-slate-400 text-sm mb-6">
        <span>Products</span> <span className="mx-2">›</span> 
        <span>Cannabis</span> <span className="mx-2">›</span> 
        <span className="text-green-500">{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="relative">
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-green-500/20">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-96 object-cover rounded-xl"
            />
            {product.lab_tested && (
              <div className="absolute top-6 left-6 bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                Lab Tested
              </div>
            )}
            {product.organic && (
              <div className="absolute top-6 right-6 bg-blue-500 px-3 py-1 rounded-full text-sm font-medium">
                Organic
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <div className="text-green-500 text-sm font-medium mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {renderStars(product.rating, 'lg')}
              <span className="text-lg">{product.rating}</span>
              <span className="text-slate-400">({product.review_count} reviews)</span>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-green-500 mb-2">${product.price}</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.in_stock 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {product.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>
          </div>

          {/* Product Specs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">THC Content</div>
              <div className="text-xl font-semibold text-green-400">{product.thc_content}%</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">CBD Content</div>
              <div className="text-xl font-semibold text-blue-400">{product.cbd_content}%</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Strain Type</div>
              <div className="text-xl font-semibold capitalize">{product.strain_type}</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Category</div>
              <div className="text-xl font-semibold capitalize">{product.type}</div>
            </div>
          </div>

          {/* Effects */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Effects</h3>
            <div className="flex flex-wrap gap-2">
              {product.effects.map((effect) => (
                <span 
                  key={effect}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>

          {/* Terpenes */}
          {product.terpenes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Dominant Terpenes</h3>
              <div className="flex flex-wrap gap-2">
                {product.terpenes.map((terpene) => (
                  <span 
                    key={terpene}
                    className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm"
                  >
                    {terpene}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1"
            disabled={!product.in_stock}
          >
            {product.in_stock ? 'Find at Nearby Stores' : 'Notify When Available'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductHeader;