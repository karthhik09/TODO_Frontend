// Greeting hook

import { useState } from 'react';

function useGreeting(name) {
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        const suffix = name ? `, ${name}!` : '!';

        if (hour < 12) return 'Good Morning' + suffix;
        if (hour < 17) return 'Good Afternoon' + suffix;
        return 'Good Evening' + suffix;
    });

    return greeting;
}

export default useGreeting;