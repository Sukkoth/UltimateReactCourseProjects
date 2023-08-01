import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const [watched, setWatched] = useState(function () {
        const storedValue = localStorage.getItem('watched');
        return JSON.parse(storedValue);
    });

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? null : id));
    }

    function hanldeCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    useEffect(() => {
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

        hanldeCloseMovie();
        fetchMovies();
    }, [query]);

    useEffect(() => {
        localStorage.setItem('watched', JSON.stringify(watched));
    }, [watched]);
    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery} />
                <NumResult movies={movies} />
            </NavBar>
            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={hanldeCloseMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUSerRating] = useState(null);

    const countRef = useRef(0);

    useEffect(() => {
        if (userRating) countRef.current += 1;
    }, [userRating]);

    const isWatched = watched.find((movie) => movie.imdbID === selectedId);

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            imdbRating: Number(imdbRating),
            title,
            year,
            poster,
            runtime: Number(runtime.split(' ').at(0)),
            userRating,
            countRatingDecisions: countRef.current,
        };
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;
    useEffect(() => {
        async function getMovieDetails() {
            try {
                setIsLoading(true);
                const res = await fetch(
                    `https://www.omdbapi.com/?apikey=50ec3be2&i=${selectedId}`
                );
                const data = await res.json();
                setMovie(data);
            } catch (error) {
                console.log(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        getMovieDetails();
    }, [selectedId]);

    useEffect(() => {
        function eventCallBack(e) {
            if (e.code === 'Escape') {
                onCloseMovie();
            }
        }
        document.addEventListener('keydown', eventCallBack);

        return () => {
            document.removeEventListener('keydown', eventCallBack);
        };
    }, [onCloseMovie]);

    useEffect(() => {
        if (title) document.title = `Movie | ${title}`;

        return () => {
            document.title = 'usePopCorn';
        };
    }, [title]);
    return (
        <div className='details'>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button className='btn-back' onClick={onCloseMovie}>
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${movie}`} />
                        <div className='details-overview'>
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐</span> {imdbRating} IMDb rating
                            </p>
                        </div>
                    </header>
                    <section>
                        <div className='rating'>
                            {!isWatched ? (
                                <>
                                    <StarRating
                                        size={24}
                                        maxRating={10}
                                        onSetRating={setUSerRating}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className='btn-add'
                                            onClick={handleAdd}
                                        >
                                            + Add to List
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>
                                    You have rated this movie{' '}
                                    {isWatched?.userRating} <span>🌟</span>
                                </p>
                            )}
                        </div>

                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring: {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}

function Loader() {
    return <p className='loader'>Loading . . . </p>;
}

function ErrorMessage({ message }) {
    return (
        <p className='error'>
            <span>📛</span> {message}
        </p>
    );
}

function Logo() {
    return (
        <div className='logo'>
            <span role='img'>🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function NumResult({ movies }) {
    return (
        <p className='num-results'>
            Found <strong>{movies.length}</strong> results
        </p>
    );
}

function Search({ query, setQuery }) {
    const inputEl = useRef(null);

    const callBackFunction = function (e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === 'Enter') {
            inputEl.current.focus();
            setQuery('');
        }
    };
    useEffect(() => {
        document.addEventListener('keydown', callBackFunction);
        inputEl.current.focus();

        return () => [
            document.removeEventListener('keydown', callBackFunction),
        ];
    }, [setQuery]);

    return (
        <input
            className='search'
            type='text'
            placeholder='Search movies...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function NavBar({ children }) {
    return (
        <nav className='nav-bar'>
            <Logo />
            {children}
        </nav>
    );
}

function Main({ children }) {
    return <main className='main'>{children}</main>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className='box'>
            <button
                className='btn-toggle'
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? '–' : '+'}
            </button>
            {isOpen && children}
        </div>
    );
}

function MovieList({ movies, onSelectMovie, onCloseMovie }) {
    return (
        <ul className='list list-movies'>
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return (
        <div className='summary'>
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
    return (
        <ul className='list'>
            {watched.map((movie) => (
                <WatchedMovie
                    movie={movie}
                    key={movie.imdbID}
                    onDeleteWatched={onDeleteWatched}
                />
            ))}
        </ul>
    );
}

function WatchedMovie({ movie, onDeleteWatched }) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.pitle} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>

                <button
                    className='btn-delete'
                    onClick={() => onDeleteWatched(movie.imdbID)}
                >
                    x
                </button>
            </div>
        </li>
    );
}
