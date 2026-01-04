import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Stationery', 'Other'];

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('all');
    const [maxPrice, setMaxPrice] = useState(5000);

    useEffect(() => {
        fetchItems();
    }, [selectedCategory, maxPrice]); // Re-fetch when filters change (debounce search ideally)

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory !== 'All') params.category = selectedCategory;
            if (searchTerm) params.search = searchTerm;
            if (maxPrice) params.maxPrice = maxPrice;

            const { data } = await api.get('/items', { params });
            // Client-side filtering for status since backend might not support it yet
            let filtered = data;
            if (statusFilter !== 'all') {
                filtered = data.filter(item => item.status === statusFilter);
            }
            setItems(filtered);
        } catch (err) {
            console.error("Error fetching items", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <SlidersHorizontal className="h-5 w-5 mr-2" /> Filters
                    </h3>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Category</h4>
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <label key={category} className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === category}
                                        onChange={() => setSelectedCategory(category)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-600 group-hover:text-blue-600">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Price Range */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <h4 className="font-medium text-gray-700">Max Price</h4>
                            <span className="text-sm text-gray-500">Rs {maxPrice}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20000"
                            step="500"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Status Tabs and Search Header */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            {['all', 'available', 'sold'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-6 py-2 rounded-lg font-semibold text-sm capitalize transition ${statusFilter === status
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-gray-500 hover:text-primary'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 placeholder-gray-400"
                                placeholder="Search items by title or description..."
                            />
                        </div>
                        <div className="hidden sm:block text-sm font-semibold text-gray-400">
                            {items.length} Items Found
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <ItemCard key={item.id} item={{
                                ...item,
                                image: item.image_url // Map backend image_url to ItemCard's expected image prop
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <Search className="h-full w-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
