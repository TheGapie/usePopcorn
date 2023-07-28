import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = "d128fe2c";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [checkMovie, setCheckMovie] = useState(null);
  const [watched, setWatched] = useLocalStorage([], "watched");
  const controller = new AbortController();

  function handleOnDeleteWatched(ID) {
    setWatched(watched.filter((movie) => movie.imdbID !== ID));
  }

  function handleCheckMovie(imdbID) {
    setCheckMovie(imdbID === checkMovie ? null : imdbID);
  }
  function handleBtnMovieClosed() {
    setCheckMovie(null);
  }

  function handleSetWatched(movie) {
    const findMovie = watched.find(
      (watchedMovie) => watchedMovie.imdbID === movie.imdbID
    );
    if (!findMovie) setWatched([...watched, movie]);
  }
  useEffect(
    function () {
      async function fetchData() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong while fetching data");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");
          setMovies(data.Search);
        } catch (err) {
          if (err.name != "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setError("");
        setMovies([]);
        return;
      }
      handleBtnMovieClosed();
      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <SearchResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MovieList movies={movies} onFocusMovie={handleCheckMovie} />
          )}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {!checkMovie ? (
            <WatchedList
              watched={watched}
              setWatched={setWatched}
              onDeleteWatched={handleOnDeleteWatched}
            />
          ) : (
            <MovieDetails
              movieID={checkMovie}
              btnMovieClosed={handleBtnMovieClosed}
              onAddWatched={handleSetWatched}
              watched={watched}
            />
          )}
        </Box>
      </Main>
    </>
  );
}

function Loading() {
  return <div className="loader">Loading...</div>;
}

function Error({ message }) {
  return <div className="error">{message}</div>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  useEffect(function () {
    inputEl.current.focus();
  }, []);
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onFocusMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onFocusMovie={onFocusMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onFocusMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onFocusMovie(movie.imdbID)}>
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

function MovieDetails({ movieID, btnMovieClosed, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isWatched = watched
    .map((watchedMovie) => watchedMovie.imdbID)
    .includes(movieID);
  const watchedUserRated = watched.find(
    (watchedMovie) => watchedMovie.imdbID === movieID
  )?.userRating;
  const {
    Title: title,
    Poster: poster,
    Released: released,
    imdbRating,
    Runtime: runtime,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useKey("Escape", btnMovieClosed);

  function handleWatched() {
    const newWatchedMovie = {
      imdbID: movieID,
      title,
      Poster: poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    btnMovieClosed();
  }
  useEffect(
    function () {
      async function getMovie() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${movieID}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovie();
    },
    [movieID]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {!isLoading ? (
        <>
          <header>
            <button className="btn-back" onClick={btnMovieClosed}>
              &larr;
            </button>
            <img src={poster} alt={title} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRate={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleWatched}>
                      + Watched
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRated} ⭐ rating</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <>
      <WatchedStat watched={watched} />
      <WatchedMoiveList watched={watched} onDeleteWatched={onDeleteWatched} />
    </>
  );
}

function WatchedStat({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoiveList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
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
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
