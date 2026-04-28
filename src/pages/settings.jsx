// Settings Page

import QRCode from 'qrcode';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Footer from '../components/footer';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI, mfaAPI } from '../services/api';

function SettingsPage({ darkMode, setDarkMode, onNavigate, sidebarOpen, setSidebarOpen, currentUser, setCurrentUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (pwd) => {
        if (!pwd) return '';
        if (pwd.length < 6) return 'Password must be at least 6 characters';
        if (pwd.length > 12) return 'Password must not exceed 12 characters';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one capital letter';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
        return '';
    };

    // MFA state
    const [mfaSetupData, setMfaSetupData] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaMessage, setMfaMessage] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);
    const [showDisableInput, setShowDisableInput] = useState(false);
    const [disableCode, setDisableCode] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

    useEffect(() => {
        if (mfaSetupData?.qrUri) {
            QRCode.toDataURL(mfaSetupData.qrUri, { width: 200, margin: 2 })
                .then(url => setQrCodeDataUrl(url))
                .catch((err) => {
                    console.error('QR generation failed:', err);
                    setQrCodeDataUrl('');
                });
        }
    }, [mfaSetupData?.qrUri]);

    // Load user data
    useEffect(() => {
        if (currentUser) {
            setEditName(currentUser.name || '');
            setEditEmail(currentUser.email || '');
            // Keeping the password blank
            setEditPassword('');
        }
    }, [currentUser]);

    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    const handleSaveProfile = async () => {
        setProfileError('');
        setProfileSuccess('');

        // Validate password
        if (editPassword) {
            const pwdValidation = validatePassword(editPassword);
            if (pwdValidation) {
                setPasswordError(pwdValidation);
                return;
            }
        }

        setSaving(true);
        try {
            const updatedUser = await authAPI.updateUser(
                currentUser.userId,
                editName,
                editEmail,
                editPassword || undefined
            );
            const safeUser = { ...currentUser, ...updatedUser };
            delete safeUser.password;
            localStorage.setItem('currentUser', JSON.stringify(safeUser));
            setCurrentUser(safeUser);
            setIsEditing(false);
            setEditPassword('');
            setPasswordError('');
            setProfileSuccess('Profile updated successfully!');
        } catch (error) {
            setProfileError(`Failed to save profile: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        setIsEditing(false);
        // Reset to current user data
        if (currentUser) {
            setEditName(currentUser.name || '');
            setEditEmail(currentUser.email || '');
            setEditPassword('');
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex flex-1">
                {/* passing setCurrentUser so Sidebar logout clears in memory state */}
                <Sidebar
                    darkMode={darkMode}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentPage="settings"
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    onNavigate={(page) => {
                        // Close sidebar on mobile
                        if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                        }
                        onNavigate(page);
                    }}
                />

                <div className={`flex-1 flex flex-col transition-all duration-300`}>
                    <div className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${sidebarOpen ? 'pl-4' : 'pl-24'} lg:pl-8`}>
                        <div className="max-w-5xl mx-auto">

                            <h1
                                className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-12"
                                style={{ color: darkMode ? '#FFFFFF' : '#1F41BB' }}
                            >
                                Settings
                            </h1>

                            <div
                                className={`max-w-2xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'
                                    } rounded-xl p-6 lg:p-8 shadow-lg`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <div>
                                        <h2
                                            className={`text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                                                }`}
                                        >
                                            Profile Info
                                        </h2>
                                        <p
                                            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                        >
                                            Your account information
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`px-6 py-2 rounded-lg transition-colors ${darkMode
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {profileError && (
                                        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded-lg text-sm">{profileError}</div>
                                    )}
                                    {profileSuccess && (
                                        <div className="p-3 bg-green-100 text-green-700 border border-green-400 rounded-lg text-sm">{profileSuccess}</div>
                                    )}
                                    <div>
                                        <label
                                            className={`block mb-2 text-sm lg:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 rounded-lg transition-all ${darkMode
                                                ? 'bg-gray-700 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                } ${!isEditing && 'opacity-60 cursor-not-allowed'} ${isEditing && 'focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={`block mb-2 text-sm lg:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 rounded-lg transition-all ${darkMode
                                                ? 'bg-gray-700 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                } ${!isEditing && 'opacity-60 cursor-not-allowed'} ${isEditing && 'focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                }`}
                                        />
                                    </div>

                                    {(!currentUser?.provider || currentUser.provider === 'LOCAL') && (
                                        <div>
                                            <label
                                                className={`block mb-2 text-sm lg:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                                    }`}
                                            >
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={editPassword}
                                                    onChange={(e) => {
                                                        setEditPassword(e.target.value);
                                                        setPasswordError(validatePassword(e.target.value));
                                                    }}
                                                    onBlur={() => setPasswordError(validatePassword(editPassword))}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-3 pr-12 rounded-lg transition-all ${darkMode
                                                        ? 'bg-gray-700 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        } ${!isEditing && 'opacity-60 cursor-not-allowed'} ${isEditing && 'focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                                                >
                                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                                </button>
                                            </div>
                                            {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="px-6 py-2 rounded-lg transition-opacity text-white shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ backgroundColor: '#1F41BB' }}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelProfile}
                                                disabled={saving}
                                                className={`px-6 py-2 rounded-lg transition-colors ${darkMode
                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                    : 'bg-gray-500 text-white hover:bg-gray-600'
                                                    } disabled:opacity-50`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {/* Appearance Section */}
                                    <div className={`pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Appearance
                                        </h3>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Theme
                                            </label>
                                            <select
                                                value={darkMode ? 'dark' : 'light'}
                                                onChange={(e) => setDarkMode(e.target.value === 'dark')}
                                                className={`px-4 py-3 rounded-lg transition-all max-w-xs ${darkMode
                                                    ? 'bg-gray-700 text-white border-gray-600'
                                                    : 'bg-gray-100 text-gray-900 border-gray-300'
                                                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            >
                                                <option value="light"> Light Mode </option>
                                                <option value="dark"> Dark Mode </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* MFA Section */}
                                {(!currentUser?.provider || currentUser.provider === 'LOCAL') && (
                                    <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Two Factor Authentication
                                        </h3>

                                        {currentUser?.mfaEnabled ? (
                                            // If MFA is already active
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                                                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>MFA is active</p>
                                                </div>

                                                {!showDisableInput ? (
                                                    <button
                                                        onClick={() => { setShowDisableInput(true); setMfaMessage(''); }}
                                                        className={`px-6 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                                                    >
                                                        Disable MFA
                                                    </button>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            maxLength={6}
                                                            placeholder="6 digit code"
                                                            value={disableCode}
                                                            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                                            className={`w-full max-w-xs px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                        />
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={async () => {
                                                                    setMfaLoading(true); setMfaMessage('');
                                                                    try {
                                                                        await mfaAPI.disableMfa(parseInt(disableCode, 10));
                                                                        const updated = { ...currentUser, mfaEnabled: false };
                                                                        localStorage.setItem('currentUser', JSON.stringify(updated));
                                                                        setCurrentUser(updated);
                                                                        setShowDisableInput(false); setDisableCode('');
                                                                        setMfaMessage('MFA has been disabled.');
                                                                    } catch (_err) {
                                                                        setMfaMessage(_err.response?.data?.message || 'Invalid code.');
                                                                    } finally { setMfaLoading(false); }
                                                                }}
                                                                disabled={mfaLoading}
                                                                className={`px-6 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-600 text-white hover:bg-gray-700'} disabled:opacity-50`}
                                                            >
                                                                {mfaLoading ? 'Verifying...' : 'Confirm Disable'}
                                                            </button>
                                                            <button
                                                                onClick={() => { setShowDisableInput(false); setDisableCode(''); }}
                                                                className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // MFA not yet enabled
                                            <div>
                                                {!mfaSetupData ? (
                                                    <div>
                                                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Secure your account with an authenticator app
                                                        </p>
                                                        <button
                                                            onClick={async () => {
                                                                setMfaLoading(true); setMfaMessage('');
                                                                try {
                                                                    const data = await mfaAPI.setupMfa();
                                                                    console.log('MFA setup data from backend:', data);
                                                                    setMfaSetupData(data);
                                                                } catch (_err) {
                                                                    setMfaMessage('Failed to start MFA setup.');
                                                                } finally { setMfaLoading(false); }
                                                            }}
                                                            disabled={mfaLoading}
                                                            className="px-6 py-2 rounded-lg transition-opacity text-white shadow-md hover:opacity-90 disabled:opacity-50"
                                                            style={{ backgroundColor: '#1F41BB' }}
                                                        >
                                                            {mfaLoading ? 'Loading...' : 'Enable MFA'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // QR code and code verification step
                                                    <div className="space-y-4">
                                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Scan this QR code with your authenticator app, then enter the 6 digit code to confirm.
                                                        </p>
                                                        {qrCodeDataUrl && (
                                                            <img
                                                                src={qrCodeDataUrl}
                                                                alt="Scan with Google Authenticator or Microsoft Authenticator"
                                                                className="mx-auto rounded-lg"
                                                                style={{ width: 200, height: 200 }}
                                                            />
                                                        )}
                                                        {mfaSetupData.secret && (
                                                            <div className={`mt-3 text-center text-xs break-all px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Can't scan? Enter this code manually:
                                                                <div className={`mt-1 font-mono font-bold tracking-widest text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                                    {mfaSetupData.secret}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={6}
                                                                placeholder="6 digit code"
                                                                value={mfaCode}
                                                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                                                className={`w-full max-w-xs px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                            />
                                                            <button
                                                                onClick={async () => {
                                                                    if (!mfaCode || mfaCode.trim().length !== 6) {
                                                                        setMfaMessage('Please enter a valid 6 digit code.');
                                                                        return;
                                                                    }

                                                                    setMfaLoading(true);
                                                                    setMfaMessage('');
                                                                    try {
                                                                        await mfaAPI.verifyMfaSetup(parseInt(mfaCode, 10));
                                                                        const updated = { ...currentUser, mfaEnabled: true };
                                                                        localStorage.setItem('currentUser', JSON.stringify(updated));
                                                                        setCurrentUser(updated);
                                                                        setMfaSetupData(null);
                                                                        setMfaCode('');
                                                                        setMfaMessage('MFA enabled successfully!');
                                                                    } catch (_err) {
                                                                        setMfaMessage(_err.response?.data?.message || 'Invalid code. Please try again.');
                                                                    } finally {
                                                                        setMfaLoading(false);
                                                                    }
                                                                }}
                                                                disabled={mfaLoading}
                                                                className="px-6 py-2 rounded-lg transition-opacity text-white shadow-md hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                                                                style={{ backgroundColor: '#1F41BB' }}
                                                            >
                                                                {mfaLoading ? 'Verifying...' : 'Verify & Enable'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Inline success or error message */}
                                        {mfaMessage && (
                                            <p className={`mt-3 text-sm ${mfaMessage.toLowerCase().includes('invalid') || mfaMessage.toLowerCase().includes('failed')
                                                ? 'text-red-500'
                                                : mfaMessage.toLowerCase().includes('disabled')
                                                    ? 'text-yellow-600'
                                                    : 'text-green-500'
                                                }`}>
                                                {mfaMessage}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Footer darkMode={darkMode} />
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;