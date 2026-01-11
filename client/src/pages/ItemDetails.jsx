import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [buying, setBuying] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { data } = await api.get(`/items/${id}`);
                setItem(data);
            } catch (err) {
                console.error("Error fetching item details", err);
                setError('Item not found or error loading details');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleBuy = async () => {
        if (!user) {
            alert('Please login to purchase items');
            navigate('/login', { state: { from: `/items/${id}` } });
            return;
        }

        if (window.confirm('Are you sure you want to buy this item?')) {
            setBuying(true);
            try {
                const { data } = await api.post(`/items/${id}/buy`);
                alert(data.message || 'Purchase successful!');
                // Update local item state to reflect sold status
                setItem(prev => ({ ...prev, status: 'sold' }));
            } catch (err) {
                console.error('Buy error:', err);
                alert(err.response?.data?.error || 'Failed to purchase item');
            } finally {
                setBuying(false);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (error || !item) return <div className="p-8 text-center text-red-500">{error || 'Item not found'}</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left: Images - Handling single image for MVP */}
                    <div className="bg-gray-100 p-2">
                        <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden mb-2">
                            <img
                                src={item.image_url || "https://placehold.co/800x600/e2e8f0/1e293b?text=No+Image"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnails placeholder if we had multiple images */}
                    </div>

                    {/* Right: Details */}
                    <div className="p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
                                    {item.category}
                                </span>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {/* Location mock as it's not in DB schema yet */}
                                    Kathmandu University
                                    <span className="mx-2">•</span>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500">
                                    <Heart className="h-6 w-6" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-blue-600">Rs {item.price}</span>
                        </div>

                        <div className="prose prose-blue text-gray-600 mb-8 max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p>{item.description}</p>
                        </div>

                        {/* Seller Card */}
                        <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                    {item.seller_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-bold text-gray-900">{item.seller_name}</h4>
                                    <p className="text-sm text-gray-500">{item.seller_email}</p>
                                </div>
                            </div>


                            {item.status?.toLowerCase() === 'sold' ? (
                                <div className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium text-center">
                                    Sold Out
                                </div>
                            ) : user && user.id === item.user_id ? (
                                <div className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-medium text-center">
                                    Your Item
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={handleBuy}
                                        disabled={buying}
                                        className="flex items-center justify-center w-full py-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {buying ? 'Processing...' : 'Buy Now'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                alert('Please login to contact the seller');
                                                navigate('/login', { state: { from: `/items/${id}` } });
                                            } else {
                                                window.location.href = `mailto:${item.seller_email}`;
                                            }
                                        }}
                                        className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition-all duration-200"
                                    >
                                        <Mail className="h-5 w-5 mr-2" /> Email Seller
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
