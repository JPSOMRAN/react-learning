import MovieCard from "../Components/MovieCard"

function Home() {
    const movies=[
        {id:1 , title:"John Wick" , release_date:"2015"},
        {id:2 , title:"Avengers" , release_date:"2019"},
        {id:3 , title:"Ghostbusters" , release_date:"2023"},
        
    ];
 
    return (<div className="home">
        <div className="movies-grid">
            {movies.map(movie=>(
             <MovieCard movie={movie} key={movie.id}/>))}
        </div>
    </div>
    );
}
export default Home;