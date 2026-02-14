import { Link } from 'react-router-dom';
import { User, PlusCircle, Search, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        // Optional: Poll for new notifications every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-2xl font-bold text-blue-600">UNI-find</span>
                    </Link>

                    {/* Center Search (Optional - can be conditional or always present) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search for items..."
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                <Link to="/sell" className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Post Item</span>
                                </Link>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition relative group"
                                    >
                                        <Bell className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <NotificationDropdown
                                            notifications={notifications}
                                            onMarkAsRead={markAsRead}
                                            onMarkAllAsRead={markAllAsRead}
                                            onClose={() => setShowNotifications(false)}
                                        />
                                    )}
                                </div>

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        {user.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-all duration-200">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <User className="inline h-4 w-4 mr-2" />
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    logout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                            >
                                                <LogOut className="inline h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 font-medium transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showDropdown || showNotifications) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowDropdown(false);
                        setShowNotifications(false);
                    }}
                />
            )}
        </nav>
    );
}
