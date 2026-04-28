// Oauth call back Page

import React, { useEffect, useState } from 'react';

function OAuthCallbackPage({ onNavigate, setCurrentUser }) {
    const [error, setError] = useState('');

    useEffect(() => {
        const hashString = window.location.hash.substring(1);
        const params = new URLSearchParams(hashString);
        const token = params.get('token');
        const userId = params.get('userId');
        const name = params.get('name');
        const email = params.get('email');

        if (!token) {
            setError('No token received from OAuth provider. Please try again.');
            return;
        }

        const provider = params.get('provider') || 'OAUTH';

        const user = {
            userId,
            name: name || 'User',
            email: email || '',
            token,
            provider,
            // OAuth users have MFA disabled
            mfaEnabled: false,
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);

        // Clean the token and other params from the URL
        window.history.replaceState({}, document.title, '/');

        onNavigate('dashboard');
    }, [onNavigate, setCurrentUser]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: '#1F41BB' }}>
                        OAuth Login Failed
                    </h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => onNavigate('login')}
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#1F41BB' }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Spinner while processing the token
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Completing login...</p>
            </div>
        </div>
    );
}

export default OAuthCallbackPage;
