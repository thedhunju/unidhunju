/*Navigation Bar*/

import { Link } from 'react-router-dom';
import { MessageCircle, User, PlusCircle, Search, GraduationCap } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
                            UNI-find
                        </span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/marketplace" className="text-gray-600 hover:text-primary font-semibold transition">
                                Marketplace
                            </Link>
                            <Link to="/lost-found" className="text-gray-600 hover:text-primary font-semibold transition">
                                Lost & Found
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link to="/sell" className="hidden sm:flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover hover:-translate-y-0.5 transition shadow-sm hover:shadow-lg font-semibold text-sm">
                                <PlusCircle className="h-4 w-4" />
                                <span>Post Item</span>
                            </Link>

                            <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                            <Link to="/profile" className="text-gray-400 hover:text-primary transition p-2 hover:bg-gray-50 rounded-full">
                                <User className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

