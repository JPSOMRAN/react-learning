import './App.css'
import MovieCard from './Components/MovieCard'
function App(){
  const movieNumber = 1;
  return(
  <>
  {movieNumber === 2 ? (
     <MovieCard movie={{title:"Tim's Film", release_date:2024}}/>
     ) : (
     <MovieCard movie={{title:"Karen's Film", release_date:2026}}/>
     )}
  </>

 );
}
export default App