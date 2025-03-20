
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { brandService } from '../services/brandService';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import { getImageSource } from '../utils/imageUtils';

const BrandAllProducts = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        const brandResponse = await brandService.getBrandById(brandId);

        if (brandResponse && brandResponse.data) {
          setBrand(brandResponse.data);
          setProducts(brandResponse.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId]);

  const getBrandLogo = () => {
    if (!brand?.brand_logo) return null;
    return getImageSource(brand.brand_logo, 'thumbnail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
            <img src={getBrandLogo()} alt={brand?.brand_name} className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{brand?.brand_name}</h1>
            <h2 className="text-lg md:text-xl text-primary">All Products</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No products found for this brand.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandAllProducts;
