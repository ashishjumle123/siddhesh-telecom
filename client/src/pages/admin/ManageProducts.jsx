import { useState, useEffect } from 'react';
import BASE_URL from '../../api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Upload, X, PlusCircle, MinusCircle } from 'lucide-react';

const WARRANTY_OPTIONS = [
    'No Warranty',
    '6 Months Warranty',
    '1 Year Warranty',
    '2 Years Warranty'
];

const REPLACEMENT_OPTIONS = [
    'No Replacement',
    '1 Day Replacement',
    '3 Days Replacement',
    '7 Days Replacement',
    '10 Days Replacement'
];

let cachedProducts = null;
let cachedCategories = null;

export default function ManageProducts() {
    const { token } = useAuth();
    const [products, setProducts] = useState(() => cachedProducts || []);
    const [categories, setCategories] = useState(() => cachedCategories || []);
    const [loading, setLoading] = useState(() => !cachedProducts);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        brand: '',
        description: '',
        price: '',
        deliveryFee: '',
        category: 'TV',
        stockQuantity: '',
        warranty: 'No Warranty',
        replacementPolicy: 'No Replacement'
    });

    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [specifications, setSpecifications] = useState([{ title: '', value: '' }]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.allSettled([
                axios.get(`${BASE_URL}/api/products?limit=100`),
                axios.get(`${BASE_URL}/api/categories`)
            ]);

            if (prodRes.status === 'fulfilled') {
                const prodData = prodRes.value.data.products || prodRes.value.data || [];
                cachedProducts = prodData;
                setProducts(prodData);
            }

            if (catRes.status === 'fulfilled') {
                const catData = Array.isArray(catRes.value.data) ? catRes.value.data : catRes.value.data?.categories || [];
                if (catData.length > 0) {
                    cachedCategories = catData;
                    setCategories(catData);
                    if (!editingId && catData[0]?.name) {
                        setFormData(prev => ({ ...prev, category: catData[0].name }));
                    }
                }
            }
        } catch (error) {
            console.error('Data load error:', error);
            if (!cachedProducts) toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}/api/products?limit=100`);
            const prodData = data.products || data || [];
            cachedProducts = prodData;
            setProducts(prodData);
        } catch (error) {
            toast.error('Failed to refresh products');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ── Specifications helpers ──────────────────────────────
    const handleSpecChange = (index, field, value) => {
        const updated = specifications.map((spec, i) =>
            i === index ? { ...spec, [field]: value } : spec
        );
        setSpecifications(updated);
    };

    const addSpec = () => {
        setSpecifications([...specifications, { title: '', value: '' }]);
    };

    const removeSpec = (index) => {
        if (specifications.length === 1) {
            setSpecifications([{ title: '', value: '' }]);
        } else {
            setSpecifications(specifications.filter((_, i) => i !== index));
        }
    };
    // ────────────────────────────────────────────────────────

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadData = new FormData();
        files.forEach(file => {
            uploadData.append('images', file);
        });

        try {
            setUploading(true);
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data: uploadedUrls } = await axios.post(`${BASE_URL}/api/upload`, uploadData, config);
            setImages(prev => [...prev, ...uploadedUrls]);
            toast.success('Images uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload images');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const handleEdit = (prod) => {
        setEditingId(prod._id);
        setFormData({
            title: prod.title,
            brand: prod.brand || '',
            description: prod.description,
            price: prod.price,
            deliveryFee: prod.deliveryFee || prod.deliveryCharge || 0,
            category: prod.category,
            stockQuantity: prod.stockQuantity,
            warranty: prod.warranty || 'No Warranty',
            replacementPolicy: prod.replacementPolicy || 'No Replacement'
        });
        setImages(prod.images || []);
        // Map old spec format (key/value) to new (title/value) gracefully
        const existingSpecs = (prod.specifications || []).map(s => ({
            title: s.title || s.key || '',
            value: s.value || ''
        }));
        setSpecifications(existingSpecs.length > 0 ? existingSpecs : [{ title: '', value: '' }]);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await axios.delete(`${BASE_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0) {
            return toast.error("At least one image is required");
        }

        // Filter out empty spec rows
        const filteredSpecs = specifications.filter(s => s.title.trim() && s.value.trim());

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                deliveryFee: Number(formData.deliveryFee),
                stockQuantity: Number(formData.stockQuantity),
                images,
                specifications: filteredSpecs
            };

            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                await axios.put(`${BASE_URL}/api/products/${editingId}`, payload, config);
                toast.success('Product updated!');
            } else {
                await axios.post(`${BASE_URL}/api/products`, payload, config);
                toast.success('Product added successfully!');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                // Show each field validation error from server (Zod)
                serverErrors.forEach(err => toast.error(`${err.field ? err.field + ': ' : ''}${err.message}`));
            } else {
                toast.error(error.response?.data?.message || 'Operation failed');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            title: '', brand: '', description: '', price: '', deliveryFee: '',
            category: 'TV', stockQuantity: '', warranty: 'No Warranty', replacementPolicy: 'No Replacement'
        });
        setImages([]);
        setSpecifications([{ title: '', value: '' }]);
    };

    if (loading) return <div className="text-center py-10">Loading products...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Inventory Setup</h2>
                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#2874f0] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> {showForm ? 'Close Form' : 'Add New Product'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Product' : 'Create New Product'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Title */}
                        <div className="md:col-span-1">
                            <label className="block text-sm text-gray-700 mb-1">Title</label>
                            <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-[#2874f0] outline-none" />
                        </div>

                        {/* Brand */}
                        <div className="md:col-span-1">
                            <label className="block text-sm text-gray-700 mb-1">Brand</label>
                            <input required name="brand" value={formData.brand} onChange={handleInputChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-[#2874f0] outline-none" />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700 mb-1">Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-[#2874f0] outline-none" rows="3" />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Price (₹)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded p-2 outline-none" />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded p-2 outline-none">
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Stock Quantity</label>
                            <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="w-full border rounded p-2 outline-none" />
                        </div>

                        {/* Delivery Fee */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Delivery Fee (₹)</label>
                            <input required type="number" name="deliveryFee" value={formData.deliveryFee} onChange={handleInputChange} className="w-full border rounded p-2 outline-none" />
                        </div>

                        {/* ── Warranty ── */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1 font-medium">
                                🛡️ Warranty
                            </label>
                            <select
                                name="warranty"
                                value={formData.warranty}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-[#2874f0] bg-white"
                            >
                                {WARRANTY_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Replacement Policy ── */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1 font-medium">
                                🔄 Replacement Policy
                            </label>
                            <select
                                name="replacementPolicy"
                                value={formData.replacementPolicy}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-[#2874f0] bg-white"
                            >
                                {REPLACEMENT_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* ── Dynamic Specifications ── */}
                        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-800">📋 Product Specifications</label>
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="flex items-center gap-1 text-sm text-[#2874f0] hover:text-blue-800 font-medium transition"
                                >
                                    <PlusCircle className="w-4 h-4" /> Add Row
                                </button>
                            </div>

                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specification Title</span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</span>
                                <span />
                            </div>

                            <div className="space-y-2">
                                {specifications.map((spec, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="e.g. Brand"
                                            value={spec.title}
                                            onChange={(e) => handleSpecChange(index, 'title', e.target.value)}
                                            className="border border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. Samsung"
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                            className="border border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 w-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(index)}
                                            className="text-red-400 hover:text-red-600 transition"
                                            title="Remove row"
                                        >
                                            <MinusCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Empty rows will be ignored on save.</p>
                        </div>

                        {/* Image Upload Section */}
                        <div className="md:col-span-2 border rounded p-4 bg-white mt-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Product Images</label>

                            <div className="flex flex-wrap gap-4 mb-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 border rounded bg-gray-50 flex items-center justify-center p-1 group">
                                        <img src={url} alt={`Upload ${idx}`} className="max-w-full max-h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                                    {uploading ? (
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500 font-medium leading-tight text-center">Upload<br />Images</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">You can select multiple files at once. The first image will be used as the main thumbnail.</p>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={resetForm} className="px-5 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={uploading} className="px-5 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                                {editingId ? 'Update Product' : 'Publish Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-800 uppercase text-xs border-b">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Warranty</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 bg-white transition-colors">
                                <td className="px-4 py-3">
                                    <img src={product.images?.[0] || 'https://via.placeholder.com/50'} alt={product.title} className="w-12 h-12 object-contain rounded bg-white shadow-sm border p-1" />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate" title={product.title}>
                                    {product.title}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{product.category}</span></td>
                                <td className="px-4 py-3 font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stockQuantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stockQuantity}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                    {product.warranty || '—'}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mx-2 transition" title="Edit">
                                        <Edit className="w-4 h-4 inline" />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 transition" title="Delete">
                                        <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No products found. Start adding inventory!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
