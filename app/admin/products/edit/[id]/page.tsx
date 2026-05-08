'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MinimalImageUpload from '@/components/admin/MinimalImageUpload';
import { 
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const COLORS = [
  { value: 'baby-pink', name: 'Baby Pink', hex: '#F8C8DC' },
  { value: 'amber-200', name: 'Amber 200', hex: '#FDE68A' },
  { value: 'black-300', name: 'Black 300', hex: '#A1A1AA' },
  { value: 'gray', name: 'Gray', hex: '#6B7280' },
  { value: 'sky-blue', name: 'Sky Blue', hex: '#7DD3FC' },
  { value: 'cream', name: 'Cream', hex: '#FFFDD0' },
  { value: 'black', name: 'Black', hex: '#000000' },
  { value: 'green', name: 'Green', hex: '#10B981' },
  { value: 'yellow-200', name: 'Yellow 200', hex: '#FEF08A' },
  { value: 'red-900', name: 'Red 900', hex: '#7F1D1D' },
  { value: 'beige', name: 'Beige', hex: '#D4B896' },
  { value: 'charcoal', name: 'Charcoal', hex: '#4A4A4A' },
  { name: 'Taupe', value:'taupe', hex: '#483C32' },
  { name: 'Indigo', value:'indigo', hex: '#4B0082' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  sku: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [] as string[],
    category: '',
    clothingType: '',
    gender: '',
    accessoriesType: '',
    availableColors: [] as string[],
    availableSizes: [] as string[],
    defaultColor: '',
    defaultSize: '',
    stock: '0',
    isActive: true,
  });

  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  
  // Track if images have been modified
  const [imagesModified, setImagesModified] = useState(false);
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📦 Fetching product:', productId);
      
      const response = await fetch(`/api/admin/products/${productId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch product');
      }
      
      const product = await response.json();
      
      console.log('✅ Product loaded, images:', product.images);

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '0',
        images: product.images && Array.isArray(product.images) ? product.images : [],
        category: product.category || '',
        clothingType: product.clothingType || '',
        gender: product.gender || '',
        accessoriesType: product.accessoriesType || '',
        availableColors: product.availableColors && Array.isArray(product.availableColors) ? product.availableColors : [],
        availableSizes: product.availableSizes && Array.isArray(product.availableSizes) ? product.availableSizes : [],
        defaultColor: product.defaultColor || '',
        defaultSize: product.defaultSize || '',
        stock: product.stock ? product.stock.toString() : '0',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      
      // Store original images for comparison
      setOriginalImages(product.images && Array.isArray(product.images) ? product.images : []);

      const stocks: Record<string, number> = {};
      
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        product.variants.forEach((variant: ProductVariant) => {
          if (variant && variant.color && variant.size) {
            const key = `${variant.color}|${variant.size}`;
            stocks[key] = variant.stock || 0;
          }
        });
        console.log('📊 Loaded stocks from existing variants:', stocks);
      } else if (product.availableColors && product.availableColors.length > 0 && 
                 product.availableSizes && product.availableSizes.length > 0) {
        for (const color of product.availableColors) {
          for (const size of product.availableSizes) {
            const key = `${color}|${size.toLowerCase()}`;
            stocks[key] = 10;
          }
        }
        console.log('📊 Initialized default stocks:', stocks);
      }
      
      setVariantStocks(stocks);
      
    } catch (err: any) {
      console.error('❌ Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const updateVariantStock = (color: string, size: string, stock: number) => {
    const key = `${color}|${size.toLowerCase()}`;
    setVariantStocks(prev => ({
      ...prev,
      [key]: stock
    }));
  };

  // Handle image upload result - ensure we only store URLs
  const handleImagesChange = (images: string[]) => {
    // Check if any of the new images are base64
    const hasBase64 = images.some(img => img.startsWith('data:image/'));
    
    if (hasBase64) {
      console.warn('⚠️ Base64 images detected - these should be uploaded to a server first');
      setError('Please use the image upload button to upload images first. Base64 images are not allowed.');
      
      // Show a user-friendly message
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setFormData(prev => ({ ...prev, images }));
    setImagesModified(true);
    console.log('📸 Images updated (URLs only):', images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.price || formData.images.length === 0) {
      setError('Please fill in all required fields: Name, Price, and at least one image');
      setSaving(false);
      return;
    }

    // Check for base64 images before submitting
    const hasBase64 = formData.images.some(img => img.startsWith('data:image/'));
    if (hasBase64) {
      setError('Cannot submit base64 images. Please upload images using the upload button first.');
      setSaving(false);
      return;
    }

    try {
      const totalStock = Object.values(variantStocks).reduce((sum, stock) => sum + (stock || 0), 0);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        // Only send images if they were modified OR if it's a valid URL
        ...(imagesModified && { images: formData.images }),
        category: formData.category || null,
        clothingType: formData.clothingType || null,
        gender: formData.gender || null,
        accessoriesType: formData.accessoriesType || null,
        availableColors: formData.availableColors,
        availableSizes: formData.availableSizes,
        defaultColor: formData.defaultColor || formData.availableColors[0] || null,
        defaultSize: formData.defaultSize || formData.availableSizes[0] || null,
        stock: totalStock,
        isActive: formData.isActive,
        variantStocks: variantStocks,
      };

      // Calculate approximate request size
      const requestSize = JSON.stringify(productData).length;
      console.log(`📦 Request size: ${(requestSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (requestSize > 900 * 1024) { // 900KB warning (most servers have 1MB limit)
        console.warn('⚠️ Request size approaching limit:', requestSize);
        setError('Request is too large. Please ensure images are URLs (not base64) and try again.');
        setSaving(false);
        return;
      }

      console.log('📤 Updating product with data (images are URLs):', {
        ...productData,
        images: productData.images?.map(img => img.substring(0, 50) + '...')
      });

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 413) {
          throw new Error('Request too large. Please ensure all images are stored as URLs, not base64 data.');
        }
        throw new Error(data.error || 'Failed to update product');
      }

      setSuccess('Product updated successfully!');
      
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error updating product:', err);
      setError(err.message);
      
      // If error is about request size, give clear instructions
      if (err.message.includes('large') || err.message.includes('size')) {
        setError('The product data is too large. This usually happens if images are stored as base64. Please re-upload images using the file upload button.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleColor = (colorValue: string) => {
    setFormData(prev => {
      const newColors = prev.availableColors.includes(colorValue)
        ? prev.availableColors.filter(c => c !== colorValue)
        : [...prev.availableColors, colorValue];
      
      if (prev.availableSizes.length > 0) {
        const newStocks: Record<string, number> = { ...variantStocks };
        
        if (newColors.includes(colorValue) && !prev.availableColors.includes(colorValue)) {
          for (const size of prev.availableSizes) {
            const key = `${colorValue}|${size.toLowerCase()}`;
            if (newStocks[key] === undefined) {
              newStocks[key] = 10;
            }
          }
        } else if (!newColors.includes(colorValue) && prev.availableColors.includes(colorValue)) {
          for (const size of prev.availableSizes) {
            const key = `${colorValue}|${size.toLowerCase()}`;
            delete newStocks[key];
          }
        }
        
        setVariantStocks(newStocks);
      }
      
      return { ...prev, availableColors: newColors };
    });
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const newSizes = prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size];
      
      if (prev.availableColors.length > 0) {
        const newStocks: Record<string, number> = { ...variantStocks };
        
        if (newSizes.includes(size) && !prev.availableSizes.includes(size)) {
          for (const color of prev.availableColors) {
            const key = `${color}|${size.toLowerCase()}`;
            if (newStocks[key] === undefined) {
              newStocks[key] = 10;
            }
          }
        } else if (!newSizes.includes(size) && prev.availableSizes.includes(size)) {
          for (const color of prev.availableColors) {
            const key = `${color}|${size.toLowerCase()}`;
            delete newStocks[key];
          }
        }
        
        setVariantStocks(newStocks);
      }
      
      return { ...prev, availableSizes: newSizes };
    });
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      clothingType: category === 'CLOTHING' ? prev.clothingType : '',
      gender: category === 'CLOTHING' ? prev.gender : '',
      accessoriesType: category === 'ACCESSORIES' ? prev.accessoriesType : '',
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalStock = Object.values(variantStocks).reduce((sum, stock) => sum + (stock || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/products"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product details and stock per size</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information - (same as before) */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="CLOTHING">Clothing</option>
                <option value="HOME_DECORE">Home Decore</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            {formData.category === 'CLOTHING' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clothing Type
                  </label>
                  <select
                    value={formData.clothingType}
                    onChange={(e) => setFormData({...formData, clothingType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Clothing Type</option>
                    <option value="CASHMERE">Cashmere</option>
                    <option value="CASHMERE_MARINO_WOOL">Cashmere + Marino Wool</option>
                    <option value="MARINO_WOOL">Marino Wool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>
              </>
            )}

            {formData.category === 'ACCESSORIES' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessories Type
                </label>
                <select
                  value={formData.accessoriesType}
                  onChange={(e) => setFormData({...formData, accessoriesType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Accessories Type</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Images - with base64 detection */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images *</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload up to 4 images. First image will be the main product image.
          </p>
          
          <MinimalImageUpload 
            images={formData.images}
            setImages={handleImagesChange}
          />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>✓ Images are stored directly in the database</p>
            <p>✓ Max 4 images per product</p>
            <p>✓ Supported formats: JPG, PNG, WEBP</p>
            {formData.images.some(img => img.length > 1000) && (
              <p className="text-amber-600 mt-2">⚠️ Warning: Some images appear to be base64 encoded. Please re-upload them as files.</p>
            )}
          </div>
        </div>

        {/* Colors, Sizes, Stock Matrix - (same as before) */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Colors</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => toggleColor(color.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    formData.availableColors.includes(color.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                  {formData.availableColors.includes(color.value) && (
                    <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {formData.availableColors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Color
                </label>
                <select
                  value={formData.defaultColor}
                  onChange={(e) => setFormData({...formData, defaultColor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select default color</option>
                  {formData.availableColors.map(color => {
                    const colorInfo = COLORS.find(c => c.value === color);
                    return (
                      <option key={color} value={color}>
                        {colorInfo?.name || color}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Sizes</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border ${
                    formData.availableSizes.includes(size)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {size}
                  {formData.availableSizes.includes(size) && (
                    <CheckCircleIcon className="inline-block h-4 w-4 ml-2 text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {formData.availableSizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Size
                </label>
                <select
                  value={formData.defaultSize}
                  onChange={(e) => setFormData({...formData, defaultSize: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select default size</option>
                  {formData.availableSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {formData.availableColors.length > 0 && formData.availableSizes.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Stock per Size & Color</h2>
            <p className="text-sm text-gray-600 mb-4">
              Set stock quantity for each color and size combination
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Color / Size</th>
                    {formData.availableSizes.map(size => (
                      <th key={size} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.availableColors.map(color => {
                    const colorInfo = COLORS.find(c => c.value === color);
                    return (
                      <tr key={color} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: colorInfo?.hex || '#000' }}
                            />
                            {colorInfo?.name || color}
                          </div>
                        </td>
                        {formData.availableSizes.map(size => {
                          const key = `${color}|${size.toLowerCase()}`;
                          const stock = variantStocks[key] || 0;
                          return (
                            <td key={`${color}-${size}`} className="px-4 py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => updateVariantStock(color, size, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Stock</td>
                    {formData.availableSizes.map(size => {
                      const totalForSize = formData.availableColors.reduce((sum, color) => {
                        const key = `${color}|${size.toLowerCase()}`;
                        return sum + (variantStocks[key] || 0);
                      }, 0);
                      return (
                        <td key={`total-${size}`} className="px-4 py-3 text-center font-medium text-gray-900">
                          {totalForSize}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Total Stock: <strong>{totalStock}</strong> items</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Status</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Make product active (visible to customers)
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating Product...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}