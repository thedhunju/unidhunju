import { useState, useEffect } from 'react';
import { X, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export default function WelcomePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
        if (!hasSeenPopup) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenWelcomePopup', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Header Background */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Heart className="h-8 w-8 text-white fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to UNI-find!</h2>
                    <p className="text-blue-100 mt-1">Your trusted campus marketplace</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="bg-green-100 p-2 rounded-full h-fit flex-shrink-0">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Verified Students Only</h3>
                                <p className="text-sm text-gray-600">Connect safely with verified peers from your university.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-amber-100 p-2 rounded-full h-fit flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Safety First</h3>
                                <p className="text-sm text-gray-600">Always meet in public campus areas and inspect items before buying.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
                    >
                        Got it, let's explore!
                    </button>
                </div>
            </div>
        </div>
    );
}
