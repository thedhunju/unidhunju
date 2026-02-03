import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { AlertCircle, User as UserIcon, Mail, Lock } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('form'); // 'form' or 'verify'
    const { showToast } = useToast();
    const { login, verifyRegister } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            // Optionally auto-trigger OTP if name/password were also there, 
            // but usually just pre-filling email is enough.
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (step === 'form') {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }

            const res = await login(email, name, 'register', password);

            if (res.success && res.requiresVerification) {
                showToast('OTP sent to your email!', 'info');
                setStep('verify');
            } else if (res.success) {
                showToast('Account created successfully!', 'success');
                navigate('/profile');
            } else {
                setError(res.message);
            }
        } else {
            // Step: verify
            if (otp.length !== 6) {
                setError('Please enter a 6-digit verification code');
                setLoading(false);
                return;
            }

            const res = await verifyRegister(email, otp);
            if (res.success) {
                showToast('Verification successful! Welcome to UniFind.', 'success');
                navigate('/profile');
            } else {
                setError(res.message);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-full w-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Join UniFind
                    </h2>
                    <p className="mt-3 text-sm text-gray-600">
                        {step === 'form' ? 'Create your account with your KU email' : `Verify the code sent to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {step === 'form' ? (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 font-medium mb-2">
                                    📧 KUmail Required
                                </p>
                                <p className="text-xs text-blue-700">
                                    Only students with @ku.edu.np or @student.ku.edu.np email addresses can register and access this platform.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        KU Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                            placeholder="your.name@ku.edu.np"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-center tracking-widest text-2xl font-bold"
                                    placeholder="000000"
                                />
                            </div>
                            <p className="mt-4 text-xs text-gray-500 text-center">
                                Did not receive the code?
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    className="ml-1 text-blue-600 font-medium hover:underline"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>{step === 'form' ? 'Creating account...' : 'Verifying...'}</span>
                            </div>
                        ) : (
                            step === 'form' ? 'Create Account' : 'Verify & Join'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-6">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                    </div>
                </form>
            </div >
        </div >
    );
}
