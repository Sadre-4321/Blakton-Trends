import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import adminService from '../../services/adminService';

const CATEGORY_OPTIONS = [
  'Formal Shirt',
  'Formal Pant',
  'Coat',
  'Waistcoat',
  'Kurta',
  'Shirt+Pant',
  '2-Piece',
  '3-Piece',
  'Kurta+Pajama',
];

const OCCASION_OPTIONS = ['Regular', 'Party', 'Wedding', 'Formal'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

const defaultValues = {
  name: '',
  description: '',
  type: 'Single',
  category: 'Formal Shirt',
  occasion: 'Regular',
  price: '',
  stock: '',
  sizes: [],
  featured: false,
  isActive: true,
};

const AdminProductFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const sizes = watch('sizes') || [];

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/products/${productId}`);
        const product = response?.data?.data ?? response?.data ?? {};
        setValue('name', product.name || '');
        setValue('description', product.description || '');
        setValue('type', product.type || 'Single');
        setValue('category', product.category || 'Formal Shirt');
        setValue('occasion', product.occasion || 'Regular');
        setValue('price', product.price ?? '');
        setValue('stock', product.stock ?? '');
        setValue('sizes', product.sizes || []);
        setValue('featured', Boolean(product.featured));
        setValue('isActive', Boolean(product.isActive));
        setExistingImages(product.images || []);
      } catch (error) {
        setErrorMessage('Unable to load product for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, setValue]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const toggleSize = (size) => {
    const current = watch('sizes') || [];
    const next = current.includes(size)
      ? current.filter((item) => item !== size)
      : [...current, size];
    setValue('sizes', next, { shouldValidate: true });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    setSelectedFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const uploadImagesToCloudinary = async (files) => {
    if (!files.length) {
      return [];
    }

    const uploadUrl = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadUrl || !uploadPreset) {
      throw new Error('Cloudinary is not configured.');
    }

    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('upload_preset', uploadPreset);
      formData.append('file', file);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || 'Image upload failed');
      }
      uploadedUrls.push(result.secure_url || result.url);
    }

    return uploadedUrls;
  };

  const onSubmit = async (values) => {
    setErrorMessage('');
    setSubmitLoading(true);
    try {
      const uploadedImages = selectedFiles.length
        ? await uploadImagesToCloudinary(selectedFiles)
        : existingImages;

      const payload = {
        name: values.name,
        description: values.description,
        type: values.type,
        category: values.category,
        occasion: values.occasion,
        price: Number(values.price),
        stock: Number(values.stock),
        sizes: values.sizes || [],
        images: uploadedImages,
        featured: Boolean(values.featured),
        isActive: Boolean(values.isActive),
      };

      if (productId) {
        await adminService.updateProduct(productId, payload);
      } else {
        await adminService.createProduct(payload);
      }

      setSuccessMessage('Product saved successfully. Redirecting...');
      setTimeout(() => navigate('/admin/products'), 900);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save product.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const previewImages = useMemo(() => {
    const existing = existingImages.map((url) => ({ url, isExisting: true }));
    const files = selectedFiles.map((file, index) => ({
      url: previewUrls[index],
      name: file.name,
      isExisting: false,
    }));
    return [...existing, ...files];
  }, [existingImages, previewUrls, selectedFiles]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-500">{productId ? 'Update product details.' : 'Create a new product listing.'}</p>
        </div>
        <Link to="/admin/products" className="btn-secondary inline-flex items-center px-4 py-2">
          Back to Products
        </Link>
      </div>

      {(errorMessage || successMessage) && (
        <div className={`rounded-lg px-4 py-3 text-sm ${successMessage ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {successMessage || errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              {...register('name', { required: 'Product name is required' })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex flex-wrap gap-3">
              {['Single', 'Set'].map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:border-slate-400">
                  <input type="radio" value={option} {...register('type')} />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Occasion</label>
            <select
              {...register('occasion')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            >
              {OCCASION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-slate-500 focus:outline-none"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Price ₹</label>
            <input
              type="number"
              step="0.01"
              {...register('price', {
                required: 'Price is required',
                min: { value: 1, message: 'Price must be at least 1' },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Stock quantity</label>
            <input
              type="number"
              {...register('stock', {
                required: 'Stock quantity is required',
                min: { value: 0, message: 'Stock cannot be negative' },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Sizes</label>
          <div className="flex flex-wrap gap-3">
            {SIZE_OPTIONS.map((size) => (
              <label key={size} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:border-slate-400">
                <input
                  type="checkbox"
                  checked={sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                />
                {size}
              </label>
            ))}
          </div>
          {errors.sizes && <p className="mt-1 text-xs text-red-600">{errors.sizes.message}</p>}
          <input type="hidden" {...register('sizes', { validate: (value) => (value?.length > 0) || 'Select at least one size' })} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Images (max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:text-white"
          />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {previewImages.map((image, index) => (
              <div key={`${image.url}-${index}`} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={image.url} alt={image.name || 'Preview'} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-4">
            <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
            <span className="text-sm text-gray-700">Featured</span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-4">
            <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
            <span className="text-sm text-gray-700">Active</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">Cloudinary upload requires VITE_CLOUDINARY_UPLOAD_URL and VITE_CLOUDINARY_UPLOAD_PRESET.</div>
          <button
            type="submit"
            disabled={submitLoading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLoading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
