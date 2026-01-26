import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <Link to={`/items/${item.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer">
                <div className="bg-gray-200 h-48 w-full relative">
                    <img
                        src={item.image_url || item.image || "https://placehold.co/400x300"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {item.status?.toLowerCase() === 'sold' && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            SOLD
                        </div>
                    )}
                    {item.status?.toLowerCase() === 'reserved' && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                            RESERVED
                        </div>
                    )}
                    {item.status?.toLowerCase() === 'pending' && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                            PENDING
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center bg-white/90 backdrop-blur-sm rounded-full pr-3 py-0.5 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                            {item.seller_picture ? (
                                <img src={item.seller_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                item.seller_name?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <span className="text-[10px] font-bold ml-2 text-gray-800">{item.seller_name}</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{item.title}</h3>
                        <span className="text-blue-600 font-bold whitespace-nowrap">Rs {item.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{item.description}</p>

                    <div className="mt-4 flex justify-between items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                        </span>
                        <span className="text-xs text-gray-400">{getTimeAgo(item.created_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
