'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useAuthStore } from '@/store/authStore';
import type { CloudinaryImage, ProductSummary } from '@/types';

type AdminProductRow = ProductSummary & {
  isActive: boolean;
  stock: number;
  images: CloudinaryImage[];
  category?: { name: string; slug: string } | null;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { firebaseUser } = useAuthStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${search}&limit=50`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8]">Products</h1>
        <Link 
          href="/admin/products/new"
          className="bg-[#E8A020] text-black font-medium px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#d6901a] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-gray-700 rounded-md py-2 pl-10 pr-4 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-sm border-b border-gray-800">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E8A020]"></div></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 relative bg-gray-800 rounded overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <CldImage src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-[#F5F0E8] max-w-xs truncate">{product.name}</td>
                    <td className="p-4 text-gray-400 capitalize">{product.category?.name || 'N/A'}</td>
                    <td className="p-4 text-gray-300">₹{product.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${product.stock > 10 ? 'bg-green-900/30 text-green-400' : product.stock > 0 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      {product.isActive ? (
                        <span className="text-green-500 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active</span>
                      ) : (
                        <span className="text-gray-500 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Draft</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product._id}/edit`} className="p-2 text-gray-400 hover:text-[#E8A020] transition-colors rounded hover:bg-gray-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
