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
];

const SIZES = ['XS','S', 'M', 'L', 'XL'];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string | null;
  clothingType: string | null;
  gender: string | null;
  accessoriesType: string | null;
  availableColors: string[];
  availableSizes: string[];
  defaultColor: string | null;
  defaultSize: string | null;
  stock: number;
  isActive: boolean;
  stripeId: string | null;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const product = await response.json();

      // Set form data with all fields
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        images: product.images || [],
        category: product.category || '',
        clothingType: product.clothingType || '',
        gender: product.gender || '',
        accessoriesType: product.accessoriesType || '',
        availableColors: product.availableColors || [],
        availableSizes: product.availableSizes || [],
        defaultColor: product.defaultColor || '',
        defaultSize: product.defaultSize || '',
        stock: product.stock.toString(),
        isActive: product.isActive,
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.name || !formData.price || formData.images.length === 0) {
      setError('Please fill in all required fields: Name, Price, and at least one image');
      setSaving(false);
      return;
    }

    try {
      // CHANGE: Removed id from request body since it's in the URL
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images: formData.images,
        category: formData.category || null,
        clothingType: formData.clothingType || null,
        gender: formData.gender || null,
        accessoriesType: formData.accessoriesType || null,
        availableColors: formData.availableColors,
        availableSizes: formData.availableSizes,
        defaultColor: formData.defaultColor || formData.availableColors[0] || null,
        defaultSize: formData.defaultSize || formData.availableSizes[0] || null,
        stock: parseInt(formData.stock),
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      setSuccess('Product updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleColor = (colorValue: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(colorValue)
        ? prev.availableColors.filter(c => c !== colorValue)
        : [...prev.availableColors, colorValue]
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size]
    }));
  };

  // Reset type fields when category changes
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

  return (
    <div>
      {/* Header with Back Button */}
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
            <p className="text-gray-600">Update product details</p>
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
        {/* Basic Information */}
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

            {/* Category Dropdown */}
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
                <option value="">Select Category *</option>
                <option value="CLOTHING">Clothing</option>
                <option value="HOME_DECORE">Home Decore</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            {/* Conditional: Clothing Type & Gender */}
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

            {/* Conditional: Accessories Type */}
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

            {/* Stock field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images *</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload up to 4 images. First image will be the main product image.
          </p>
          
          <MinimalImageUpload 
            images={formData.images}
            setImages={(images) => setFormData({...formData, images})}
          />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>✓ Images are stored directly in the database</p>
            <p>✓ Max 4 images per product</p>
            <p>✓ Supported formats: JPG, PNG, WEBP</p>
          </div>
        </div>

        {/* Colors */}
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

        {/* Sizes */}
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

        {/* Status */}
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

        {/* Submit */}
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