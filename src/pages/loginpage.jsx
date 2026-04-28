// Login Page

import React, { useState } from 'react';
import Footer from "../components/footer";
import { authAPI, mfaAPI } from '../services/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

function LoginPage({ onNavigate, setCurrentUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // MFA state
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [mfaCode, setMfaCode] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password.length > 12) return 'Password must not exceed 12 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one capital letter';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
        return '';
    };

    const handleLogin = async () => {
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password);
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);
        if (emailValidationError || passwordValidationError) return;

        setLoading(true);
        setError('');
        try {
            const response = await authAPI.login(email, password);

            if (response.mfaRequired) {
                // MFA is enabled
                setTempToken(response.tempToken);
                setMfaRequired(true);
            } else {
                // Normal login
                const user = { ...response, mfaEnabled: response.mfaEnabled ?? false };
                localStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentUser(user);
                onNavigate('dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Called when the user submits TOTP code
    const handleMfaSubmit = async () => {
        if (!mfaCode) { setError('Please enter the 6 digit code.'); return; }
        setLoading(true);
        setError('');
        try {
            const user = await mfaAPI.mfaLogin(tempToken, parseInt(mfaCode, 10));
            const stored = { ...user, mfaEnabled: true };
            localStorage.setItem('currentUser', JSON.stringify(stored));
            setCurrentUser(stored);
            onNavigate('dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // MFA screen
    if (mfaRequired) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md flex-grow flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-8" style={{ color: '#1F41BB' }}>ToDo</h1>
                    <div className="bg-white rounded-3xl shadow-lg p-10">
                        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#1F41BB' }}>
                            Two Factor Authentication
                        </h2>
                        <p className="text-center text-gray-700 font-semibold mb-8 leading-relaxed">
                            Enter the 6 digit code from your authenticator app
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="px-4">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="xxxxxx"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMfaSubmit()}
                                disabled={loading}
                                maxLength={6}
                                className="w-full px-6 py-4 mb-8 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base text-center tracking-widest disabled:opacity-50"
                            />

                            <button
                                onClick={handleMfaSubmit}
                                disabled={loading}
                                className="w-full py-4 text-white text-base font-semibold rounded-xl mb-4 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#1F41BB' }}
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>

                            <button
                                onClick={() => { setMfaRequired(false); setTempToken(''); setMfaCode(''); setError(''); }}
                                className="w-full text-gray-700 text-base font-semibold hover:text-blue-600 transition-colors py-2"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md flex-grow flex flex-col justify-center">
                <h1 className="text-5xl font-bold mb-8" style={{ color: '#1F41BB' }}>
                    ToDo
                </h1>

                <div className="bg-white rounded-3xl shadow-lg p-10">
                    <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#1F41BB' }}>
                        Login here
                    </h2>
                    <p className="text-center text-gray-700 font-semibold mb-12 leading-relaxed">
                        Welcome back you've
                        <br />
                        been missed!
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="px-4">
                        <div className="mb-12">
                            <div className="mb-6">
                                <input
                                    type="email"
                                    placeholder="sample@mail.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                    onBlur={() => setEmailError(validateEmail(email))}
                                    disabled={loading}
                                    className={`w-full px-6 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base block disabled:opacity-50 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                                    onBlur={() => setPasswordError(validatePassword(password))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    disabled={loading}
                                    className={`w-full px-6 py-4 pr-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base block disabled:opacity-50 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-4 text-white text-base font-semibold rounded-xl mb-6 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1F41BB' }}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>

                        <button
                            onClick={() => onNavigate('signup')}
                            disabled={loading}
                            className="w-full text-gray-700 text-base font-semibold hover:text-blue-600 transition-colors py-2 disabled:opacity-50"
                        >
                            Create new account
                        </button>

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

            <Footer />
        </div>
    );
}

export default LoginPage;