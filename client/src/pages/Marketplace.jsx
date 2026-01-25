import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState(5000);
    const location = useLocation();
    const navigate = useNavigate();

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const updateURL = (newParams) => {
        const params = new URLSearchParams(location.search);
        Object.keys(newParams).forEach(key => {
            if (newParams[key] === null || newParams[key] === 'All' || newParams[key] === '') {
                params.delete(key);
            } else {
                params.set(key, newParams[key]);
            }
        });
        navigate(`/marketplace?${params.toString()}`, { replace: true });
        setShowMobileFilters(false); // Close mobile filters on selection
    };

    // Sync URL -> State and Fetch
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category') || 'All';
        const searchParam = params.get('search') || '';
        const priceParam = params.get('maxPrice') || '5000';

        // Find matching category case-insensitively
        const match = CATEGORIES.find(c => c.toLowerCase() === categoryParam.toLowerCase()) || 'All';

        setSelectedCategory(match);
        setSearchTerm(searchParam);
        setMaxPrice(parseInt(priceParam));

        const debounceTimer = setTimeout(() => {
            fetchFilteredItems(match, searchParam, parseInt(priceParam));
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [location.search]);

    const fetchFilteredItems = async (category, search, price) => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            if (price) params.maxPrice = price;

            const { data } = await api.get('/items', { params });
            setItems(data);
        } catch (err) {
            console.error("Error fetching items", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden sticky top-[64px] z-30 bg-gray-50/80 backdrop-blur-md py-4 px-1 -mx-4 mb-2 border-b border-gray-200">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-700 shadow-sm active:scale-95 transition-all"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    {selectedCategory !== 'All' && (
                        <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                            {selectedCategory}
                        </span>
                    )}
                </button>
            </div>

            {/* Sidebar Filters */}
            <aside className={`
                ${showMobileFilters ? 'block' : 'hidden md:hidden lg:block'} 
                w-full lg:w-64 flex-shrink-0 space-y-8 bg-white p-6 rounded-xl border border-gray-100 h-fit 
                lg:sticky lg:top-24 z-20 transition-all duration-300
            `}>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><SlidersHorizontal className="h-5 w-5 mr-2" /> Filters</span>
                        <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-gray-400 p-1 hover:bg-gray-100 rounded">
                            <X className="h-5 w-5" />
                        </button>
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
                                        onChange={() => updateURL({ category })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-200">{category}</span>
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
                            onChange={(e) => updateURL({ maxPrice: e.target.value })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Search Header */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => updateURL({ search: e.target.value })}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Search marketplace..."
                        />
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                        Showing {items.length} records
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse text-gray-400">Loading items...</div>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
