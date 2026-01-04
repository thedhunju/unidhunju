import { useState, useEffect } from 'react';
import api from '../api';
import { Mail, ArrowRight, User } from 'lucide-react';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/messages');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>

            {loading ? (
                <div className="text-center py-12">Loading messages...</div>
            ) : messages.length > 0 ? (
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium text-gray-900">{msg.sender_name}</span>
                                        <span>•</span>
                                        <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-medium text-gray-900">
                                        Regarding: <span className="text-blue-600">{msg.item_title || 'General Inquiry'}</span>
                                    </h3>
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mt-2">
                                        {msg.content}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <button className="flex items-center text-blue-600 font-medium hover:underline gap-1">
                                        Reply <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="text-gray-500 mt-2">When people contact you about your listings, messages will appear here.</p>
                </div>
            )}
        </div>
    );
}
