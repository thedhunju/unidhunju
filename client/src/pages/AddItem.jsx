import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function AddItem() {
    const [images, setImages] = useState([]); // Preview URLs
    const [files, setFiles] = useState([]); // Actual File objects
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('description', formData.description);

            files.forEach(file => {
                data.append('images', file);
            });

            await api.post('/items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate('/marketplace');
        } catch (err) {
            console.error("Failed to post item", err);
            alert('Failed to list item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Ad</h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="What are you selling?"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            required
                            className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        rows="5"
                        required
                        className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your item (condition, reason for selling, etc.)"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden group">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 h-32">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Add Photo</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">First picture is the title picture. You can upload up to 5 photos.</p>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/marketplace')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 active:scale-95 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {loading ? 'Posting...' : 'Post Ad'}
                    </button>
                </div>
            </form>
        </div>
    );
}
