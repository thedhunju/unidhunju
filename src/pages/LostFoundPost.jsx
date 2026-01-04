import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Upload } from 'lucide-react';

export default function LostFoundPost() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Lost',
        title: '',
        description: '',
        location: '',
        date_lost_found: '',
        contact_info: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            await api.post('/lost-found', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/lost-found');
        } catch (error) {
            console.error('Error posting:', error);
            alert('Failed to submit post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Report Lost/Found Item</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center transition ${formData.type === 'Lost' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="Lost"
                                    checked={formData.type === 'Lost'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="font-bold">Lost Something</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center transition ${formData.type === 'Found' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="Found"
                                    checked={formData.type === 'Found'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="font-bold">Found Something</span>
                            </label>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What was it?</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="e.g. Blue Jansport Backpack"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Provide as much detail as possible..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                placeholder="e.g. Block 9 Canteen"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date_lost_found"
                                value={formData.date_lost_found}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                        <input
                            type="text"
                            name="contact_info"
                            value={formData.contact_info}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Phone number, email, or social handle"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                {formData.image && <p className="text-sm text-green-600 mt-2">Selected: {formData.image.name}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
