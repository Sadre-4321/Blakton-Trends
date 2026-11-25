import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const FILTER_OPTIONS = ['All', 'Single', 'Set'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await adminService.getProducts();
        setProducts(response?.data?.data ?? response?.data ?? []);
      } catch (error) {
        setErrorMessage('Unable to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchTerm
        ? product.name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesFilter = filterType === 'All' || product.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterType]);

  const handleToggleActive = async (product) => {
    const nextState = !product.isActive;
    setStatusUpdatingIds((ids) => [...ids, product.id]);
    try {
      await adminService.updateProductStatus(product.id, { isActive: nextState });
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, isActive: nextState } : item
        )
      );
    } catch (error) {
      setErrorMessage('Unable to update product status.');
    } finally {
      setStatusUpdatingIds((ids) => ids.filter((id) => id !== product.id));
    }
  };

  const handleConfirmDelete = (product) => {
    setDeleteTarget(product);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingProductId(deleteTarget.id);
    try {
      await adminService.deleteProduct(deleteTarget.id);
      setProducts((items) => items.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage('Failed to delete product.');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Products Management</h1>
          <p className="text-sm text-gray-500">Manage all product listings, activation, and inventory.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products/add" className="btn-primary inline-flex items-center px-4 py-2">
            + Add New Product
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilterType(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${filterType === option ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex-1 lg:max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thumbnail</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={product.thumbnail || product.image || product.images?.[0] || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="h-full w-full object-contain bg-[#faf8f5]"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{product.price?.toFixed?.(2) ?? product.price}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={statusUpdatingIds.includes(product.id)}
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {statusUpdatingIds.includes(product.id) ? 'Updating...' : product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/products/add?edit=${product.id}`}
                      className="text-slate-700 hover:text-slate-900"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(product)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete product</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                disabled={deletingProductId === deleteTarget.id}
              >
                {deletingProductId === deleteTarget.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
