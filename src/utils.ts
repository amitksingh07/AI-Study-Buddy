export const getApiUrl = () => {
    // For the hackathon, we force the production URL to avoid Vercel Preview/SSO CORS issues
    // caused by misconfigured environment variables.
    if (window.location.hostname !== 'localhost') {
        return 'https://ai-study-buddy-backend-omega.vercel.app';
    }
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
};
