// Footer Component

import React from 'react';

function Footer({ darkMode }) {
    return (
        <footer
            className={`text-center text-xs lg:text-sm py-6 mt-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
        >
            &copy; 2026 Karthik Sai Nandeti. All rights are reserved.
        </footer>
    );
}

export default Footer;