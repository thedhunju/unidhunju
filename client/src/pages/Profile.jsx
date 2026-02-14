import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { User, MapPin, Mail, Edit, Package, CheckCircle, Heart, LogOut, X } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('active');

    // Auth context user is basic payload, we want full profile + stats
    // But for MVP, Dashboard returns basic user. 
    // We'll manage local profile state to update immediately on edit.
    const [profile, setProfile] = useState({
        name: 'Loading...',
        email: '',
        faculty: 'Student',
        avatar: 'https://placehold.co/150x150/3b82f6/ffffff?text=User',
        location: 'KU, Dhulikhel'
    });

    const [myItems, setMyItems] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { logout, refreshUser, user } = useAuth();


    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            // Fetch User Details
            const userRes = await api.get('/dashboard');
            if (userRes.data.user) {
                const profilePic = userRes.data.user.picture
                    ? `http://localhost:3000${userRes.data.user.picture}`
                    : `https://placehold.co/150x150/3b82f6/ffffff?text=${userRes.data.user.name.charAt(0)}`;

                setProfile(prev => ({
                    ...prev,
                    name: userRes.data.user.name,
                    email: userRes.data.user.email,
                    avatar: profilePic
                }));
                setEditName(userRes.data.user.name);
                setImagePreview(profilePic);
            }

            // Fetch Items
            const itemsRes = await api.get('/my-items');
            setMyItems(itemsRes.data);

            // Fetch Purchases
            const purchasesRes = await api.get('/my-purchases');
            setMyPurchases(purchasesRes.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editName);
            if (imageFile) {
                formData.append('avatar', imageFile);
            }

            const res = await api.put('/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state
            setProfile(prev => ({
                ...prev,
                name: res.data.user.name,
                avatar: `http://localhost:3000${res.data.user.picture}`
            }));

            // Update global context
            if (refreshUser) {
                refreshUser(res.data.user);
            }

            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Calculate Counts
    const activeCount = myItems.length; // For now assuming all my items are active or sold, total listings
    const soldCount = myItems.filter(i => i.status?.toLowerCase() === 'sold').length;

    // Filter for Display
    const displayedItems = activeTab === 'active'
        ? myItems.filter(i => i.status?.toLowerCase() !== 'sold')
        : activeTab === 'sold'
            ? myItems.filter(i => i.status?.toLowerCase() === 'sold')
            : activeTab === 'purchases'
                ? myPurchases
                : [];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative">

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="absolute top-8 right-8 text-gray-400 hover:text-red-600 flex items-center gap-2 transition"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                        <img
                            src={profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:3000${profile.avatar}`}
                            alt={profile.name}
                            className="w-32 h-32 rounded-full border-4 border-blue-50 object-cover"
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                            <p className="text-blue-600 font-medium">{profile.faculty}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:justify-start text-gray-500">
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" /> {profile.email}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" /> {profile.location}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start pt-4">
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{activeCount}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Listings</span>
                            </div>
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{soldCount}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Sold</span>
                            </div>
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{myPurchases.length}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Bought</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                />
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                                    <img
                                        src={imagePreview || profile.avatar}
                                        alt="Profile Preview"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 transition"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <div className="text-white text-xs font-medium">Change</div>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs & Listings */}
            <div>
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8 justify-center md:justify-start">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`${activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Package className="h-4 w-4 mr-2" /> Active Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('sold')}
                            className={`${activeTab === 'sold'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Sold items
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`${activeTab === 'purchases'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Package className="h-4 w-4 mr-2" /> My Purchases
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : displayedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedItems.map(item => (
                            <div key={item.id} className="relative group">
                                <ItemCard item={item} />
                                {activeTab === 'active' && (
                                    <Link
                                        to={`/items/${item.id}?edit=true`}
                                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white text-blue-600"
                                        title="Edit Listing"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No {activeTab} items found</h3>
                        <p className="text-gray-500 mt-2">Items you list will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
