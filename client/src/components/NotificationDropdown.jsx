import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, CheckCircle, XCircle, ShoppingBag, Clock } from 'lucide-react';

export default function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) {
    const navigate = useNavigate();

    const getTimeAgo = (dateString) => {
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
        return "Just now";
    };

    const getIcon = (type) => {
        switch (type) {
            case 'reservation_request': return <ShoppingBag className="h-4 w-4 text-blue-600" />;
            case 'reservation_accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'reservation_rejected':
            case 'reservation_cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'item_sold': return <ShoppingBag className="h-4 w-4 text-green-600" />;
            case 'comment':
            case 'reply': return <MessageSquare className="h-4 w-4 text-purple-600" />;
            default: return <Bell className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center bg-white">
                        <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.is_read) onMarkAsRead(notif.id);
                                    if (notif.item_id) navigate(`/items/${notif.item_id}`);
                                    onClose();
                                }}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition flex gap-3 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${notif.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${!notif.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center mt-1 text-[10px] text-gray-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {getTimeAgo(notif.created_at)}
                                    </div>
                                </div>
                                {!notif.is_read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-50 text-center">
                <button
                    onClick={onClose}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
