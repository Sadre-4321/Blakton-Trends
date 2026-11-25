import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const BUTTON_CLASSES = 'rounded-lg px-4 py-2 text-sm font-semibold transition duration-150';

const uploadImageToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Image upload failed');
  }

  return data.secure_url;
};

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({ title: '', order: 1, isActive: true, imageUrl: '', imageFile: null });
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBanners();
      setBanners(response?.data?.data ?? response?.data ?? []);
    } catch (err) {
      setGlobalError('Unable to load banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setForm({ title: '', order: 1, isActive: true, imageUrl: '', imageFile: null });
    setFormError('');
  };

  const openAddModal = () => {
    resetForm();
    setEditingBanner(null);
    setModalOpen(true);
    setSuccessMessage('');
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      order: banner.order ?? 1,
      isActive: banner.isActive ?? true,
      imageUrl: banner.image || banner.imageUrl || '',
      imageFile: null,
    });
    setFormError('');
    setModalOpen(true);
    setSuccessMessage('');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setEditingBanner(null);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((current) => ({
      ...current,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
  };

  const saveBanner = async (event) => {
    event.preventDefault();
    setFormError('');
    setGlobalError('');
    setSuccessMessage('');

    if (!form.imageUrl && !form.imageFile) {
      setFormError('Banner image is required.');
      return;
    }

    if (!form.order || Number(form.order) < 1) {
      setFormError('Display order must be 1 or higher.');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = form.imageUrl;

      if (form.imageFile) {
        imageUrl = await uploadImageToCloudinary(form.imageFile);
      }

      const payload = {
        title: form.title || '',
        order: Number(form.order),
        isActive: form.isActive,
        image: imageUrl,
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
        setSuccessMessage('Banner updated successfully.');
      } else {
        await adminService.createBanner(payload);
        setSuccessMessage('Banner added successfully.');
      }

      closeModal();
      fetchBanners();
    } catch (err) {
      setFormError(err?.message || err?.response?.data?.message || 'Unable to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (banner) => {
    setDeleteTarget(banner);
    setGlobalError('');
    setSuccessMessage('');
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setGlobalError('');
    try {
      await adminService.deleteBanner(deleteTarget.id);
      setSuccessMessage('Banner deleted successfully.');
      setDeleteTarget(null);
      fetchBanners();
    } catch (err) {
      setGlobalError('Unable to delete banner.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await adminService.patchBanner(banner.id, { isActive: !banner.isActive });
      setBanners((current) => current.map((item) => (item.id === banner.id ? { ...item, isActive: !item.isActive } : item)));
    } catch (err) {
      setGlobalError('Unable to update banner status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Banner Management</h1>
          <p className="text-sm text-gray-500">Manage homepage banners and their display order.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add New Banner
          </button>
        </div>
      </div>

      {globalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{globalError}</div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{successMessage}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-3 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-3 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            No banners available.
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 5' }}>
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner image'}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-gray-500">No image</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  Order {banner.order ?? 0}
                </span>
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{banner.title || 'Untitled Banner'}</h2>
                  <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: banner.isActive ? '#059669' : '#dc2626' }}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`${BUTTON_CLASSES} ${banner.isActive ? 'border border-red-500 text-red-600 hover:bg-red-50' : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(banner)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(banner)}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
                <p className="text-sm text-gray-500">Upload banner details and choose display order.</p>
              </div>
              <button type="button" onClick={closeModal} className="text-gray-500 hover:text-slate-900">Close</button>
            </div>
            <form onSubmit={saveBanner} className="space-y-4 px-6 py-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:border-slate-500">
                      Choose file
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-slate-50 p-3 text-sm text-gray-600">
                      {form.imageFile ? form.imageFile.name : form.imageUrl ? 'Current image selected' : 'No image selected'}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Cloudinary upload is required for a new image.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Optional banner title"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    name="order"
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    Active
                  </label>
                </div>
              </div>

              {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{formError}</div>}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900">Delete banner</h2>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this banner?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={cancelDelete} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
