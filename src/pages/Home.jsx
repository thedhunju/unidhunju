import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Books', icon: '📚' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Other', icon: '📦' },
];

export default function Home() {
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await api.get('/items');
                setRecentItems(response.data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="bg-white py-16 px-4 text-center border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-dark to-primary">
                            Welcome to UNI-find
                        </h1>
                        <p className="text-xl text-gray-500 font-medium">
                            Kathmandu University's Student Marketplace
                        </p>
                    </div>

                    <div className="relative max-w-2xl mx-auto mt-10">
                        <div className="flex items-center bg-white border-2 border-gray-100 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 rounded-2xl p-2 transition-all shadow-sm">
                            <div className="pl-4 pr-2 text-gray-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="text"
                                className="block w-full py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none sm:text-lg"
                                placeholder="Search for items, books, furniture..."
                            />
                            <select className="hidden md:block border-l-2 border-gray-100 px-4 py-2 text-gray-600 bg-transparent focus:outline-none cursor-pointer font-medium">
                                <option>All Categories</option>
                                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.name} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 group">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <h3 className="font-medium text-gray-900">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Listings */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recently Listed</h2>
                    <a href="/marketplace" className="text-blue-600 font-medium hover:text-blue-700">View All &rarr;</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentItems.length > 0 ? (
                        recentItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No items listed yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
