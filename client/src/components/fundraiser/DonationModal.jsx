import { useState } from 'react';
import { X, Heart, CreditCard, User, Mail, Lock, Phone, CheckCircle, AlertCircle, Loader, Gift, Sparkles } from 'lucide-react';

export default function DonationModal({ campaign, onClose, onSuccess }) {
    const [step, setStep] = useState('amount'); // amount, auth, payment, success, failed
    const [donorType, setDonorType] = useState(null); // guest, new, returning
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [message, setMessage] = useState('');

    // Guest form (minimal info)
    const [guestForm, setGuestForm] = useState({
        name: '',
        email: ''
    });

    // Registration form
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    // Login form
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    // Donor data after auth
    const [donor, setDonor] = useState(null);
    const [donationResult, setDonationResult] = useState(null);

    const predefinedAmounts = [10, 25, 50, 100, 250, 500];
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

    const handleAmountNext = () => {
        if (!finalAmount || finalAmount <= 0) {
            setError('Please select or enter a donation amount');
            return;
        }
        setError('');
        setStep('auth');
    };

    const handleRegister = async () => {
        if (!registerForm.name || !registerForm.email || !registerForm.password) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/donors/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...registerForm,
                    isGuestConverted: true
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setDonor(data.donor);
            localStorage.setItem('donorToken', data.token);
            localStorage.setItem('donor', JSON.stringify(data.donor));
            setStep('payment');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            setError('Please enter email and password');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/donors/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setDonor(data.donor);
            localStorage.setItem('donorToken', data.token);
            localStorage.setItem('donor', JSON.stringify(data.donor));
            setStep('payment');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestContinue = () => {
        if (!guestForm.name || !guestForm.email) {
            setError('Please enter your name and email');
            return;
        }
        setError('');
        setStep('payment');
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Prepare donation data based on donor type
            const donationData = {
                campaignId: campaign._id,
                amount: finalAmount,
                isAnonymous,
                message
            };

            // Add donor-specific data
            if (donorType === 'guest') {
                donationData.donorName = guestForm.name;
                donationData.donorEmail = guestForm.email;
                donationData.isGuest = true;
            } else if (donor) {
                donationData.donorId = donor.id;
                donationData.donorName = donor.name;
                donationData.donorEmail = donor.email;
                donationData.isGuest = false;
            }

            // Step 1: Create donation
            const donateResponse = await fetch('http://localhost:5000/api/fundraiser/donate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donationData)
            });

            const donateData = await donateResponse.json();
            if (!donateResponse.ok) throw new Error(donateData.message);

            // Step 2: Process payment (simulated)
            const paymentResponse = await fetch(`http://localhost:5000/api/fundraiser/payment/${donateData.donationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod: 'card' })
            });

            const paymentData = await paymentResponse.json();

            if (paymentData.success) {
                setDonationResult(paymentData.donation);
                setStep('success');
                if (onSuccess) onSuccess();
            } else {
                setStep('failed');
            }
        } catch (err) {
            setError(err.message || 'Payment failed');
            setStep('failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
                {/* Header */}
                <div className={`relative p-6 bg-gradient-to-br ${campaign.color || 'from-pink-500 to-rose-500'} rounded-t-3xl`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
                            {campaign.icon || '💝'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                            <p className="text-white/70 text-sm">Supporting this campaign</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="text-red-400 w-5 h-5 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: Select Amount */}
                    {step === 'amount' && (
                        <div className="animate-fade-up">
                            <h4 className="text-lg font-bold text-white mb-4">Choose Amount</h4>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {predefinedAmounts.map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                                        className={`py-3 rounded-xl font-bold transition-all ${selectedAmount === amount && !customAmount
                                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-slate-400 mb-2 block">Custom Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                                        placeholder="Enter amount"
                                        className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Optional message */}
                            <div className="mb-6">
                                <label className="text-sm text-slate-400 mb-2 block">Leave a message (optional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share why you're supporting this cause..."
                                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Anonymous option */}
                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-pink-500 focus:ring-pink-500"
                                />
                                <span className="text-slate-300 text-sm">Make my donation anonymous</span>
                            </label>

                            <button
                                onClick={handleAmountNext}
                                disabled={!finalAmount || finalAmount <= 0}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                Continue - ${finalAmount || 0}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Auth (Guest Registration or Login) */}
                    {step === 'auth' && (
                        <div className="animate-fade-up">
                            {!donorType ? (
                                <>
                                    <h4 className="text-lg font-bold text-white mb-6 text-center">How would you like to continue?</h4>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setDonorType('guest')}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-xl transition-colors text-left px-5 border border-slate-700 hover:border-pink-500/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                                    <Sparkles className="text-green-400 w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">Donate as Guest</p>
                                                    <p className="text-sm text-slate-400">Quick donation - no account needed</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setDonorType('new')}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-xl transition-colors text-left px-5 border border-slate-700 hover:border-pink-500/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                                    <Gift className="text-pink-400 w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">New Donor</p>
                                                    <p className="text-sm text-slate-400">Create an account to track donations</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setDonorType('returning')}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-xl transition-colors text-left px-5 border border-slate-700 hover:border-pink-500/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                                    <User className="text-purple-400 w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">Returning Donor</p>
                                                    <p className="text-sm text-slate-400">Sign in to your account</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                    <button onClick={() => setStep('amount')} className="w-full text-slate-500 mt-6 text-sm hover:text-white">
                                        ← Back to amount
                                    </button>
                                </>
                            ) : donorType === 'guest' ? (
                                <>
                                    <h4 className="text-lg font-bold text-white mb-4">Guest Donation</h4>
                                    <p className="text-sm text-slate-400 mb-4">Just provide your name and email - no account required!</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={guestForm.name}
                                                    onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                                                    placeholder="Your name"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    value={guestForm.email}
                                                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGuestContinue}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl mt-6 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Continue to Payment</>}
                                    </button>
                                    <button onClick={() => setDonorType(null)} className="w-full text-slate-500 mt-4 text-sm hover:text-white">
                                        ← Back
                                    </button>
                                </>
                            ) : donorType === 'new' ? (
                                <>
                                    <h4 className="text-lg font-bold text-white mb-4">Create Donor Account</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={registerForm.name}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                                    placeholder="Your name"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    value={registerForm.email}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Password *</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={registerForm.password}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                                    placeholder="Create password"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Phone (optional)</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    value={registerForm.phone}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                                    placeholder="Your phone number"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRegister}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl mt-6 hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Create Account & Continue</>}
                                    </button>
                                    <button onClick={() => setDonorType(null)} className="w-full text-slate-500 mt-4 text-sm hover:text-white">
                                        ← Back
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-lg font-bold text-white mb-4">Welcome Back!</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    value={loginForm.email}
                                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400 mb-1 block">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                    placeholder="Your password"
                                                    className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl mt-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <>Sign In & Continue</>}
                                    </button>
                                    <button onClick={() => setDonorType(null)} className="w-full text-slate-500 mt-4 text-sm hover:text-white">
                                        ← Back
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Payment */}
                    {step === 'payment' && (
                        <div className="animate-fade-up">
                            <h4 className="text-lg font-bold text-white mb-4">Complete Payment</h4>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Donation Amount</span>
                                    <span className="text-2xl font-black text-white">${finalAmount}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50 text-sm">
                                    <span className="text-slate-500">Donating as: </span>
                                    <span className="text-white font-medium">
                                        {donorType === 'guest' ? guestForm.name : donor?.name}
                                        {donorType === 'guest' && <span className="ml-2 text-green-400">(Guest)</span>}
                                    </span>
                                </div>
                            </div>

                            {/* Simulated payment form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Card Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="4242 4242 4242 4242"
                                            className="w-full bg-slate-800 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                            defaultValue="4242 4242 4242 4242"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                            defaultValue="12/28"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-pink-500 focus:outline-none"
                                            defaultValue="123"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-4 text-center">
                                🔒 This is a simulated payment for demonstration purposes.
                            </p>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin w-5 h-5" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Heart size={18} />
                                        Complete Donation - ${finalAmount}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Success */}
                    {step === 'success' && (
                        <div className="animate-fade-up text-center py-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-2xl font-black text-white mb-2">Thank You! 🎉</h4>
                            <p className="text-slate-400 mb-6">
                                Your generous donation of <span className="text-green-400 font-bold">${finalAmount}</span> has been received!
                            </p>

                            {donationResult && (
                                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50 text-left">
                                    <p className="text-xs text-slate-500 mb-2">Receipt Number</p>
                                    <p className="text-white font-mono font-bold">{donationResult.receiptNumber}</p>
                                    <p className="text-xs text-slate-500 mt-2 mb-1">Transaction Ref</p>
                                    <p className="text-white font-mono text-sm">{donationResult.transactionRef}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Close
                                </button>
                                <button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2">
                                    <Sparkles size={18} />
                                    Share
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Failed */}
                    {step === 'failed' && (
                        <div className="animate-fade-up text-center py-6">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">Payment Failed</h4>
                            <p className="text-slate-400 mb-6">
                                We couldn't process your payment. Please try again.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { setStep('payment'); setError(''); }}
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
