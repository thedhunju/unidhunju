import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Stationery', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Used - Good', 'Used - Fair'];

export default function AddItem() {
    const [images, setImages] = useState([]); // Preview URLs
    const [files, setFiles] = useState([]); // Actual File objects
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        condition: '', // Added
        price: '',
        description: '',
        seller_phone: '', // Added
        seller_social_platform: '', // Added
        seller_social_handle: '' // Added
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);

        // Create preview URLs
        const newImages = selectedFiles.map(file => URL.createObjectURL(file));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        const newFiles = [...files];
        newImages.splice(index, 1);
        newFiles.splice(index, 1);
        setImages(newImages);
        setFiles(newFiles);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

       } catch (err) {
        console.error("Failed to post item", err);
        // Show the actual error message from backend
        const errorMessage = err.response?.data?.error || 
                           err.response?.data || 
                           err.message || 
                           'Failed to list item. Please try again.';
        alert(errorMessage);
    } finally {
        setLoading(false);
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Post a New Ad</h1>
                <p className="text-gray-500 font-medium">Fill in the details below to list your item in the marketplace.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Item Information</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ad Title *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"
                            placeholder="e.g. iPhone 13 Pro Max"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category *</label>
                            <select
                                name="category"
                                required
                                className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-medium"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Condition *</label>
                            <select
                                name="condition"
                                required
                                className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-medium"
                                value={formData.condition}
                                onChange={handleChange}
                            >
                                <option value="">Select Condition</option>
                                {CONDITIONS.map(cond => (
                                    <option key={cond} value={cond}>{cond}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Price (NPR) *</label>
                            <input
                                type="number"
                                name="price"
                                required
                                className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"
                                placeholder="5000"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description *</label>
                        <textarea
                            name="description"
                            rows="5"
                            required
                            className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"
                            placeholder="Describe your item in detail (reason for selling, warranty, etc.)"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>

                <div className="space-y-6 pt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number *</label>
                            <input
                                type="tel"
                                name="seller_phone"
                                required
                                className="block w-full border-2 border-gray-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"
                                placeholder="98XXXXXXXX"
                                value={formData.seller_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Social</label>
                                <select
                                    name="seller_social_platform"
                                    className="block w-full border-2 border-gray-50 rounded-2xl px-4 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-medium"
                                    value={formData.seller_social_platform}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Twitter">Twitter/X</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Handle</label>
                                <input
                                    type="text"
                                    name="seller_social_handle"
                                    className="block w-full border-2 border-gray-50 rounded-2xl px-4 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium"
                                    placeholder="@username"
                                    value={formData.seller_social_handle}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Photos</h3>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg scale-90 group-hover:scale-100"
                                >
                                    <X className="h-4 w-4 stroke-[3]" />
                                </button>
                            </div>
                        ))}

                        <label className="aspect-square border-4 border-dashed border-gray-50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group">
                            <Upload className="h-8 w-8 text-gray-300 group-hover:text-primary transition-colors mb-2" />
                            <span className="text-xs font-bold text-gray-300 group-hover:text-primary uppercase tracking-widest transition-colors">Add Photo</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/marketplace')}
                        className="px-8 py-4 border-2 border-gray-100 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 transition transform hover:-translate-y-0.5 active:translate-y-0 order-1 sm:order-2"
                    >
                        {loading ? 'Posting...' : 'Post Item'}
                    </button>
                </div>
            </form>
        </div>
    );
}
