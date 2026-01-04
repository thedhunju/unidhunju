import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Tag, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function LostFound() {
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Lost', 'Found'
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = activeTab !== 'All' ? { type: activeTab } : {};
            const response = await api.get('/lost-found', { params });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportClick = (e) => {
        if (!user) {
            e.preventDefault();
            alert('Please login to report an item.');
            navigate('/login', { state: { from: '/lost-found/new' } });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
                    <p className="text-gray-500 mt-1">Report lost items or help return found ones</p>
                </div>
                <Link
                    to="/lost-found/new"
                    onClick={handleReportClick}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Report Item
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
                {['All', 'Lost', 'Found'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === type
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="relative h-48 bg-gray-100">
                                {post.image_url ? (
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Tag className="h-12 w-12" />
                                    </div>
                                )}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${post.type === 'Lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {post.type}
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{post.location || 'Unknown location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>{post.date_lost_found ? new Date(post.date_lost_found).toLocaleDateString() : 'Date not specified'}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">{post.user_name}</span>
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                alert('Please login to contact this user.');
                                                navigate('/login');
                                            } else {
                                                alert('Messaging feature coming soon!'); // Or navigate to a message thread
                                            }
                                        }}
                                        className="text-blue-600 text-sm font-medium hover:underline"
                                    >
                                        Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <p className="text-gray-500">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} items found.</p>
                </div>
            )}
        </div>
    );
}
