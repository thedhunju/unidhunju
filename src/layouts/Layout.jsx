/* Basic Layout*/
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Uni-Find. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

