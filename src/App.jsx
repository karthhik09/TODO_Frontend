// Main Application Component

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/loginpage';
import SignupPage from './pages/signuppage';
import DashboardPage from './pages/dashboard';
import SettingsPage from './pages/settings';
import OAuthCallbackPage from './pages/oauthcallback';

function App() {
  //State Management
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'login';
  });

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme === 'true';
  });

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //Load saved theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.body.classList.add('bg-gray-900');
    } else {
      document.body.classList.remove('bg-gray-900');
    }
  }, [darkMode]);

  //Session Management, restore user session if exists
  useEffect(() => {
    if (window.location.pathname === '/oauth-callback') {
      setCurrentPage('oauth-callback');
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    const savedPage = localStorage.getItem('currentPage');

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      if (!savedPage || savedPage === 'login' || savedPage === 'signup') {
        setCurrentPage('dashboard');
      }
    } else {
      if (savedPage !== 'signup' && savedPage !== 'oauth-callback') {
        setCurrentPage('login');
      }
    }
  }, []);

  //Page Props
  const pageProps = {
    onNavigate: setCurrentPage,
    currentUser,
    setCurrentUser,
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen
  };

  //Pages to display
  return (
    <>
      {currentPage === 'login' && <LoginPage {...pageProps} />}
      {currentPage === 'signup' && <SignupPage {...pageProps} />}
      {currentPage === 'dashboard' && <DashboardPage {...pageProps} />}
      {currentPage === 'settings' && <SettingsPage {...pageProps} />}
      {currentPage === 'oauth-callback' && <OAuthCallbackPage {...pageProps} />}
    </>
  );
}

export default App;