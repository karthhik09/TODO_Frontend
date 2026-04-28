// Subscription Component

import React, { useState } from 'react';
import { LuCrown } from 'react-icons/lu';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { subscriptionAPI } from '../services/api';

function SubscriptionModal({ darkMode, currentUser, setCurrentUser, onClose }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const plans = {
        'monthly': { price: 99, label: 'Monthly', period: 'month' },
        'half-yearly': { price: 299, label: 'Half Yearly', period: '6 months' },
        'yearly': { price: 699, label: 'Yearly', period: 'year' },
    };

    const isPremium = currentUser?.isPremium;

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) { resolve(true); return; }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handleSubscribe = async () => {
        setLoading(true);
        setMessage('');

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setMessage('Failed to load payment gateway. Please try again.');
                setLoading(false);
                return;
            }

            const order = await subscriptionAPI.createOrder(selectedPlan);

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'ToDo Premium',
                description: `${plans[selectedPlan].label} Premium Subscription`,
                order_id: order.orderId,
                handler: async (response) => {
                    // verify payment on backend
                    try {
                        const result = await subscriptionAPI.verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            selectedPlan
                        );
                        if (result.success) {
                            const updated = {
                                ...currentUser,
                                isPremium: true,
                                subscriptionExpiry: result.subscriptionExpiry,
                            };
                            localStorage.setItem('currentUser', JSON.stringify(updated));
                            setCurrentUser(updated);
                            setMessage('You are now a Premium member!');
                        }
                    } catch (err) {
                        // Log of the backend error
                        console.error('Payment verification error:', err.response?.data || err.message);
                        setMessage('Payment received but verification failed. Contact support.');
                    } finally {
                        // Payment flow is complete
                        setLoading(false);
                    }
                },
                prefill: {
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                },
                theme: { color: '#1F41BB' },
                modal: {
                    // User dismissed without paying, clear loading
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (err) {
            // Order creation failed, log the error, then clear loading
            console.error('Order creation error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const formatExpiry = (expiry) => {
        if (!expiry) return '';
        const d = new Date(expiry);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 text-xl font-bold leading-none ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}
                >
                    X
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(31,65,187,0.12)' }}>
                        <LuCrown className="text-3xl" style={{ color: '#1F41BB' }} />
                    </div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isPremium ? 'You are Premium!' : 'Go Premium'}
                    </h2>
                    {isPremium && currentUser?.subscriptionExpiry && (
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Active until {formatExpiry(currentUser.subscriptionExpiry)}
                        </p>
                    )}
                </div>

                {/* Plan selector */}
                {!isPremium && (
                    <div className={`rounded-xl p-5 mb-6 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        {/* Plan tabs */}
                        <div className="flex gap-2 mb-4">
                            {Object.entries(plans).map(([key, plan]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedPlan(key)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${selectedPlan === key
                                        ? darkMode
                                            ? 'bg-blue-600 text-white border-blue-500'
                                            : 'bg-blue-100 text-blue-700 border-blue-300'
                                        : darkMode
                                            ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {plan.label}
                                </button>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Rs.{plans[selectedPlan].price}
                            </span>
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                /{plans[selectedPlan].period}
                            </span>
                        </div>

                        {/* Features */}
                        <ul className={`space-y-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {['Unlimited tasks', '24/7 support', 'Premium badge'].map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <IoCheckmarkCircleOutline
                                        className="text-green-500 text-xl shrink-0"
                                    />
                                    <span className="leading-none">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Inline message */}
                {message && (
                    <p className={`text-sm text-center mb-4 ${message.includes('Premium') ? 'text-green-500' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}

                {/* Action button */}
                {!isPremium ? (
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#1F41BB' }}
                    >
                        {loading ? 'Processing...' : `Subscribe Now Rs.${plans[selectedPlan].price}`}
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#1F41BB' }}
                    >
                        Done
                    </button>
                )}
            </div>
        </div>
    );
}

export default SubscriptionModal;