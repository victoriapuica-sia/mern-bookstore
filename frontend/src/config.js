/**
 * Configurarea aplicatiei frontend.
 *
 * Vite expune in cod doar variabilele de mediu care incep cu VITE_.
 * Pentru dezvoltare folosim valoarea implicita (backend-ul local din L2);
 * Pentru publicare (L9) setam VITE_API_URL pe Vercel.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Imaginea afisata cand o carte nu are o coperta
export const PLACEHOLDER_IMAGE = '/book-placeholder.svg';
