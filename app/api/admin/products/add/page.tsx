// app/admin/products/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS, SIZES } from '@/lib/constants';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [''],
    category: '',
    availableColors: [] as string[],
    availableSizes: [] as string[],
    defaultColor: '',
    defaultSize: '',
    stock: '0',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'your-admin-token', // Replace with actual auth
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      alert('Product created successfully!');
      router.push('/admin/products');
    } catch (error) {
      alert('Failed to create product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter(c => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (€) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => toggleColor(color.value)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    formData.availableColors.includes(color.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                  style={{ backgroundColor: formData.availableColors.includes(color.value) ? color.hex + '20' : undefined }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes
            </label>
            <div className="flex gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded border ${
                    formData.availableSizes.includes(size)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Default Selections */}
          {formData.availableColors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Color
              </label>
              <select
                value={formData.defaultColor}
                onChange={(e) => setFormData({...formData, defaultColor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select default color</option>
                {formData.availableColors.map(color => (
                  <option key={color} value={color}>
                    {COLORS.find(c => c.value === color)?.name || color}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.availableSizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Size
              </label>
              <select
                value={formData.defaultSize}
                onChange={(e) => setFormData({...formData, defaultSize: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select default size</option>
                {formData.availableSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              value={formData.images.join('\n')}
              onChange={(e) => setFormData({...formData, images: e.target.value.split('\n').filter(url => url.trim())})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}