import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, ArrowLeft, Heart, Share2, Clock, Check, Phone, Hash, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRevealedOpen, setIsRevealedOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { data } = await api.get(`/items/${id}`);
                setItem(data);
            } catch (err) {
                console.error("Error fetching item details", err);
                setError('Item not found or error loading details');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleBuyClick = () => {
        if (!user) {
            navigate('/login', { state: { from: `/items/${id}` } });
            return;
        }
        setIsConfirmOpen(true);
    };

    const handleConfirmBuy = () => {
        setIsConfirmOpen(false);
        setIsRevealedOpen(true);
    };

    if (loading) return <div className="p-12 text-center text-gray-400 font-medium">Loading details...</div>;
    if (error || !item) return <div className="p-12 text-center text-red-500 font-medium">{error || 'Item not found'}</div>;

    const socialIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram': return <Instagram className="h-5 w-5" />;
            case 'facebook': return <Facebook className="h-5 w-5" />;
            case 'twitter': return <Twitter className="h-5 w-5" />;
            case 'linkedin': return <Linkedin className="h-5 w-5" />;
            default: return <Hash className="h-5 w-5" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Link to="/marketplace" className="inline-flex items-center text-gray-400 hover:text-primary font-semibold transition group">
                <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-11">

                    {/* Left: Images (5 columns) */}
                    <div className="lg:col-span-5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-50">
                        <div className="w-full aspect-square relative flex items-center justify-center">
                            {item.image_url || item.image ? (
                                <img
                                    src={item.image_url || item.image}
                                    alt={item.title}
                                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                                />
                            ) : (
                                <div className="text-gray-200">
                                    <Clock className="h-24 w-24" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Details (6 columns) */}
                    <div className="lg:col-span-6 p-8 md:p-12 flex flex-col">
                        <div className="mb-6 flex justify-between items-start">
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                    {item.condition && (
                                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {item.condition}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{item.title}</h1>
                                <div className="flex items-center text-gray-400 text-sm font-medium">
                                    <MapPin className="h-4 w-4 mr-1.5" /> KU Campus
                                    <span className="mx-3 text-gray-200">|</span>
                                    <Clock className="h-4 w-4 mr-1.5" /> Posted {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-red-500 transition shadow-sm border border-gray-100">
                                    <Heart className="h-6 w-6" />
                                </button>
                                <button className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-primary transition shadow-sm border border-gray-100">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="text-base font-bold text-gray-400 uppercase tracking-widest mb-1 text-xs">Price</div>
                            <div className="text-4xl font-black text-primary">NPR {Number(item.price).toLocaleString()}</div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Description</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>

                        {/* Actions & Seller */}
                        <div className="mt-auto pt-8 border-t border-gray-50 space-y-8">
                            <button
                                onClick={handleBuyClick}
                                className="w-full py-4 bg-success text-white rounded-2xl font-bold text-lg hover:bg-green-600 transition shadow-lg shadow-success/20 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Buy Now
                            </button>

                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl">
                                    {item.seller_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-5 flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{item.seller_name}</h4>
                                    <div className="flex items-center mt-1">
                                        <span className="text-gray-300 font-mono tracking-widest text-sm">••••••••••</span>
                                        <span className="ml-3 text-[10px] font-bold text-primary uppercase tracking-widest">Hidden</span>
                                    </div>
                                </div>
                                <div className="p-2 flex flex-col items-end gap-1">
                                    <div className="flex items-center text-success text-[10px] font-black uppercase tracking-widest">
                                        <Check className="h-3 w-3 mr-1" /> Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Purchase Modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Purchase"
                maxWidth="400px"
            >
                <div className="text-center space-y-6 py-2">
                    <p className="text-gray-500 font-medium">
                        Are you sure you want to buy <span className="text-gray-900 font-bold">{item.title}</span>? This will reveal the seller's contact information.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmBuy}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition shadow-lg shadow-primary/20"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Contact Revealed Modal */}
            <Modal
                isOpen={isRevealedOpen}
                onClose={() => setIsRevealedOpen(false)}
                maxWidth="450px"
            >
                <div className="text-center space-y-8 py-4">
                    <div className="mx-auto w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                        <Check className="h-8 w-8 stroke-[3]" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Purchase Successful!</h2>
                        <p className="text-gray-500 font-medium text-sm">You can now contact the seller directly.</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5 text-left">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seller Name</label>
                            <div className="text-lg font-bold text-gray-900">{item.seller_name}</div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Details</label>
                            <div className="space-y-4 font-bold text-gray-700">
                                <a href={`tel:${item.seller_phone || '98XXXXXXXX'}`} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/30 transition shadow-sm group">
                                    <div className="p-2 bg-primary/5 rounded-lg text-primary mr-3 group-hover:bg-primary group-hover:text-white transition">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    {item.seller_phone || '9841XXXXXX'}
                                </a>
                                <a href={`mailto:${item.seller_email}`} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/30 transition shadow-sm group">
                                    <div className="p-2 bg-primary/5 rounded-lg text-primary mr-3 group-hover:bg-primary group-hover:text-white transition">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    {item.seller_email}
                                </a>
                                {item.seller_social_handle && (
                                    <div className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="p-2 bg-primary/5 rounded-lg text-primary mr-3">
                                            {socialIcon(item.seller_social_platform)}
                                        </div>
                                        {item.seller_social_handle}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsRevealedOpen(false)}
                        className="w-full py-4 bg-dark text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
}
