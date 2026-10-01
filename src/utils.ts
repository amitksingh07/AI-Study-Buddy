export const getApiUrl = () => {
    const rawUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://ai-study-buddy-backend-omega.vercel.app');
    return rawUrl.replace(/\/$/, '');
};
