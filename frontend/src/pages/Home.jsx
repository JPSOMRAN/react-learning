import MovieCard from "../Components/MovieCard"
import {useState} from "react"
function Home() {
    const [searchQuery,setSearchQuery]=useState("");
    const movies=[
        
        {id:1 , title:"John Wick" , release_date:"2015"},
        {id:2 , title:"Avengers" , release_date:"2019"},
        {id:3 , title:"Ghostbusters" , release_date:"2023"},
        {id:4 , title:"Joker" , release_date:"2023"},
    ];
    
    const handleSearch=(e)=>{
        e.preventDefault()
        alert(searchQuery)
        setSearchQuery("------")
    }
    return (<div className="home">
        <form onSubmit={handleSearch} className="search-form">
            <input 
            type="text" 
            placeholder="Search For Movies...." 
            className="search-input"
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
        </form>
        <div className="movies-grid">
            {movies.map(
            movie=>
             movie.title.toLowerCase().startsWith(searchQuery) && (
             <MovieCard movie={movie} key={movie.id}/>
             )
            )}
        </div>
    </div>
    );
}
export default Home;