import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '550px' }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full rounded-2xl shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300"
                style={{ maxWidth }}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
