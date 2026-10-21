import { useState, useEffect } from 'react';
import BASE_URL from '../../api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Edit, Upload, X, Eye, ExternalLink, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function ManageBanners() {
    const { token } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        image: '',
        alt: '',
        link: '/',
        isActive: true
    });

    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/api/banners?all=true`);
            setBanners(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('images', file);

        try {
            setUploading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data: uploadedUrls } = await axios.post(`${BASE_URL}/api/upload`, uploadData, config);
            if (uploadedUrls && uploadedUrls.length > 0) {
                setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
                toast.success('Image uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleEdit = (banner) => {
        setEditingId(banner._id);
        setFormData({
            image: banner.image || '',
            alt: banner.alt || '',
            link: banner.link || '/',
            isActive: banner.isActive !== undefined ? banner.isActive : true
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleStatus = async (banner) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const newStatus = !banner.isActive;
            await axios.put(`${BASE_URL}/api/banners/${banner._id}`, { isActive: newStatus }, config);
            toast.success(`Banner ${newStatus ? 'activated' : 'deactivated'}`);
            setBanners(banners.map(b => b._id === banner._id ? { ...b, isActive: newStatus } : b));
        } catch (error) {
            toast.error('Failed to update banner status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${BASE_URL}/api/banners/${id}`, config);
            toast.success('Banner deleted successfully');
            setBanners(banners.filter(b => b._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image.trim()) {
            return toast.error('Please upload or provide a banner image');
        }

        try {
            setSubmitting(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                const { data: updated } = await axios.put(`${BASE_URL}/api/banners/${editingId}`, formData, config);
                toast.success('Banner updated successfully!');
                setBanners(banners.map(b => b._id === editingId ? updated : b));
            } else {
                const { data: created } = await axios.post(`${BASE_URL}/api/banners`, formData, config);
                toast.success('Banner created successfully!');
                setBanners([created, ...banners]);
            }

            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save banner');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            image: '',
            alt: '',
            link: '/',
            isActive: true
        });
    };

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-[#2874f0]" />
                        Homepage Banners
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Banners appear below categories and above products on the main home screen.
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#2874f0] text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition font-medium shadow-sm text-sm"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Close Form' : 'Add New Banner'}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 transition-all animate-fadeIn">
                    <div className="flex justify-between items-center mb-5 pb-3 border-b">
                        <h3 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Edit Banner' : 'Upload New Banner'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Image Upload / URL Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Banner Image <span className="text-red-500">*</span>
                            </label>
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                {formData.image ? (
                                    <div className="relative w-full md:w-80 h-32 border rounded-lg overflow-hidden bg-gray-50 group">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition"
                                            title="Remove image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full md:w-80 h-32 border-2 border-dashed border-gray-300 hover:border-[#2874f0] rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50/50 transition">
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs text-gray-500 font-medium">Uploading to Cloudinary...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center p-3">
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <span className="text-xs font-semibold text-[#2874f0]">Click to upload banner</span>
                                                <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP (Recommended: ~1600x350)</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}

                                <div className="flex-1 w-full">
                                    <span className="text-xs font-medium text-gray-500 block mb-1">Or paste direct image URL:</span>
                                    <input
                                        type="url"
                                        name="image"
                                        placeholder="https://example.com/banner.jpg"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Tip: High-resolution landscape images look best across mobile and desktop devices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Title and Link Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Banner Title / Alt Description
                                </label>
                                <input
                                    type="text"
                                    name="alt"
                                    placeholder="e.g. Festive Electronics Sale 50% Off"
                                    value={formData.alt}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Click Redirect URL / Path
                                </label>
                                <input
                                    type="text"
                                    name="link"
                                    placeholder="e.g. /category/Smartphones or /"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] outline-none"
                                />
                                <span className="text-[11px] text-gray-400">Where the customer lands when clicking the banner</span>
                            </div>
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#2874f0] rounded border-gray-300 focus:ring-[#2874f0]"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Active (Show immediately on homepage slider)
                            </label>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className="px-5 py-2 bg-[#2874f0] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                {editingId ? 'Update Banner' : 'Publish Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banner List Table / Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-gray-800">Current Banners</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Total {banners.length} banner{banners.length === 1 ? '' : 's'} configured
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-700">No Banners Found</h4>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                            You haven't uploaded any banners yet. Click the button below to add your first banner to the homepage.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 bg-[#2874f0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                        >
                            <Plus className="w-4 h-4" /> Add First Banner
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {banners.map((banner, index) => (
                            <div
                                key={banner._id || index}
                                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/80 transition"
                            >
                                {/* Left: Preview + Details */}
                                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                    <div className="w-28 sm:w-36 h-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0 shadow-xs relative">
                                        <img
                                            src={banner.image}
                                            alt={banner.alt || 'Banner'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-sm text-gray-800 truncate">
                                                {banner.alt || 'Untitled Banner'}
                                            </h4>
                                            <button
                                                onClick={() => handleToggleStatus(banner)}
                                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition ${
                                                    banner.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                title="Click to toggle active status"
                                            >
                                                {banner.isActive ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-green-600" /> Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 text-gray-400" /> Inactive
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
                                            <span className="font-medium text-gray-400">Target:</span>
                                            <span className="font-mono text-gray-600 truncate">{banner.link || '/'}</span>
                                        </div>

                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            Added on {new Date(banner.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Action buttons */}
                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="p-2 text-gray-600 hover:text-[#2874f0] hover:bg-blue-50 rounded-lg transition"
                                        title="Edit banner"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner._id)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete banner"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
