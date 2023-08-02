import { useState, useEffect } from 'react';

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // callback?.();
        const controller = new AbortController();

        async function fetchMovies() {
            try {
                setError('');
                setIsLoading(true);
                const res = await fetch(
                    `https://www.omdbapi.com/?apikey=50ec3be2&s=${query}`,
                    { signal: controller.signal }
                );

                if (!res.ok)
                    throw new Error(
                        'Something went wrong with fetching movies'
                    );

                const data = await res.json();
                if (data.Response === 'False')
                    throw new Error('Movie Not Found');
                setMovies(data.Search);
                setError('');
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message);
            } finally {
                setIsLoading(false);
            }
            return () => {
                controller.abort();
            };
        }
        if (query.length < 3) {
            setMovies([]);
            setError('');
            return;
        }

        // hanldeCloseMovie();
        fetchMovies();
    }, [query]);

    return { movies, isLoading, error };
}
