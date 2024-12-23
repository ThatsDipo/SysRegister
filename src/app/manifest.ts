import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SysRegister',
        short_name: 'SysRegister',
        description: 'Un nuovo modo di consultare il registro 🖥️',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        "screenshots": [
            {
                "src": "/mobile-screen.png",
                "sizes": "388x854",
                "type": "image/png",
            },
            {
                "src": "/desktop-screen.png",
                "sizes": "1894x983",
                "type": "image/png",
            }
        ]
    }
}