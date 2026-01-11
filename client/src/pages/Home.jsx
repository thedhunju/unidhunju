import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = [
    { name: 'Books', icon: '📚' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Clothing', icon: '👕' },
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
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Welcome to UNI-find
                    </h1>
                    <p className="text-lg text-blue-100">
                        Where Students Connect, Trade, and Find.
                    </p>

                    <div className="relative max-w-lg mx-auto mt-8">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-3 border-none rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Search for books, electronics, and more..."
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/marketplace?category=${cat.name}`}
                            className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 group block"
                        >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <h3 className="font-medium text-gray-900">{cat.name}</h3>
                        </Link>
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
