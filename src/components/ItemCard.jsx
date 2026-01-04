import { Clock, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
    const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });

    return (
        <Link to={`/items/${item.id}`} className="block group">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-primary/20 flex flex-col h-full">
                <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                    {item.image_url || item.image ? (
                        <img
                            src={item.image_url || item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <Box className="h-12 w-12 text-gray-200" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${item.status === 'sold' ? 'bg-gray-100 text-gray-500' : 'bg-success/10 text-success'
                            }`}>
                            {item.status || 'available'}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            {item.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                        </h3>
                    </div>

                    <div className="text-xl font-extrabold text-primary mb-3">
                        NPR {Number(item.price).toLocaleString()}
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {item.description}
                    </p>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-gray-400 text-xs font-medium">
                        <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            {formattedDate}
                        </div>
                        <div className="text-gray-300">KU Campus</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}


