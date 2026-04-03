export interface BusinessConfigurationInterface {
    businessName: string;
    businessSlogan: string;
    logoPath: string;
    contactPhone: string;
    contactEmail: string;
    instagramUrl: string;
    address: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor: string;
        surfaceColor: string;
        textColor: string;
        textSecondaryColor: string;
        accentColor: string;
        fontFamily: string;
    };
    features: {
        googleCalendarIntegration: boolean;
        bookingHistory: boolean;
        serviceEstimatedDuration: boolean;
    };
}

export const businessConfiguration: BusinessConfigurationInterface = {
    businessName: 'Barbearia Template',
    businessSlogan: 'Estilo e precisao',
    logoPath: '/images/logo.svg',
    contactPhone: '(49) 99999-9999',
    contactEmail: 'contato@barbearia.com',
    instagramUrl: 'https://instagram.com/barbearia',
    address: 'Rua Exemplo, 123 - Centro',
    theme: {
        primaryColor: '#c8a964',
        secondaryColor: '#1a1a2e',
        backgroundColor: '#0f0f1a',
        surfaceColor: '#1a1a2e',
        textColor: '#ffffff',
        textSecondaryColor: '#a0a0b0',
        accentColor: '#d4af37',
        fontFamily: "'Inter', sans-serif",
    },
    features: {
        googleCalendarIntegration: true,
        bookingHistory: true,
        serviceEstimatedDuration: true,
    },
};
