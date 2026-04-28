// Signup Page

import React, { useState } from 'react';
import Footer from "../components/footer";
import { authAPI } from '../services/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

function SignupPage({ onNavigate, setCurrentUser }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        if (password.length > 12) {
            return 'Password must not exceed 12 characters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one capital letter';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must contain at least one special character';
        }
        return '';
    };

    const handleSignup = async () => {
        // Validate inputs

        if (!name) {
            setError('Name is required');
            return;
        }

        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password);

        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);

        if (emailValidationError || passwordValidationError) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = await authAPI.register(name, email, password);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentUser(user);
            onNavigate('dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md flex-grow flex flex-col justify-center">
                {/* App Title */}
                <h1 className="text-5xl font-bold mb-8 text-left" style={{ color: '#1F41BB' }}>
                    ToDo
                </h1>

                {/* Signup Card */}
                <div className="bg-white rounded-3xl shadow-lg p-10">
                    {/* Header */}
                    <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#1F41BB' }}>
                        Create Account
                    </h2>
                    <p className="text-center text-gray-700 font-semibold mb-12 leading-relaxed">
                        Create an account here!
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="px-4">
                        <div className="mb-12">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="w-full px-6 py-4 mb-6 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base block disabled:opacity-50"
                            />

                            <div className="mb-6">
                                <input
                                    type="email"
                                    placeholder="sample@mail.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError('');
                                    }}
                                    onBlur={() => setEmailError(validateEmail(email))}
                                    disabled={loading}
                                    className={`w-full px-6 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base block disabled:opacity-50 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {emailError && (
                                    <p className="mt-2 text-sm text-red-600">{emailError}</p>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    onBlur={() => setPasswordError(validatePassword(password))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                                    disabled={loading}
                                    className={`w-full px-6 py-4 pr-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base block disabled:opacity-50 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <button
                            onClick={handleSignup}
                            disabled={loading}
                            className="w-full py-4 text-white text-base font-semibold rounded-xl mb-6 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1F41BB' }}
                        >
                            {loading ? 'Creating account...' : 'Create'}
                        </button>

                        <button
                            onClick={() => onNavigate('login')}
                            disabled={loading}
                            className="w-full text-gray-700 text-base font-semibold hover:text-blue-600 transition-colors py-2 disabled:opacity-50"
                        >
                            Login to existing account
                        </button>

                        {/* OAuth Signup Options */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="relative flex items-center justify-center">
                                <hr className="w-full border-gray-300" />
                                <span className="absolute bg-white px-3 text-sm text-gray-500">Or continue with</span>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/oauth2/authorization/google`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                                >
                                    <FcGoogle size={20} />
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/oauth2/authorization/github`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                                >
                                    <FaGithub size={20} />
                                    GitHub
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer at bottom */}
            <Footer />
        </div>
    );
}

export default SignupPage;