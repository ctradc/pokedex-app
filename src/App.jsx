import { useEffect, useState } from "react";
import Loader from './component/loader';

function App() {

    const [pokemonData, setPokemonData] = useState([]);

    const GottaFetchEmAll = async () => {
        let cachedData =false;
        if (cachedData) {
        } else {
            //offset permite recordar en donde nos quedamos en la peticion del API, se guarda en localStorage
            let offset = Number(localStorage.getItem("offset"));
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=30&offset=${offset}`);
            offset=offset+30; // se agregan 30 pokemons nuevos, pero puede ser mano o menos
            localStorage.setItem("offset",offset.toString())
            const data = await response.json();
            let urls = data.results.map(pokemon => pokemon.url);
            let pokemonDetails = await Promise.all(urls.map(async (url) => {
                let res = await fetch(url);
                return await res.json();
            }));
            let pokeDetailsLight = [];
            // se reduce la informacion del pokemon a la mas importante y fundamental
            pokeDetailsLight = pokemonDetails.map((p)=>{
              return {
                id: p.id,
                name:p.name,
                base_experience:p.base_experience,
                weight:p.weight,
                height:p.height,
                image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png`
              };
            });
            pokeDetailsLight.forEach(p=>localStorage.setItem(p.id, JSON.stringify(p)));
            // hook para recordar a todos los pokemones anteriores y no solo los mas recientes
            setPokemonData((prevData) => [...prevData, ...pokeDetailsLight]);
        }
    };

    /*
      si se recarga o cierra la pestana,
      ya no es necesario volver a pedir desde cero los pokemones,
      ya que estan guardos en localStorage
    */
    const GottaFetchEmAllIntern = () => {
      
      let datosLocalStorage = [];

      for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        const valor = localStorage.getItem(clave);
        if(clave!=="pageReloaded"){
          if(clave!=="offset"){
            datosLocalStorage.push(JSON.parse(valor));
          }
        }
      }
      // para imprimir los pokemon en orden ascendente numerico
      datosLocalStorage.sort((a, b) => a.id - b.id);
      setPokemonData((prevData) => [...prevData, ...datosLocalStorage]);
  };
    
    const handleScroll = () => {
        if(window.innerHeight+document.documentElement.scrollTop+1>=document.documentElement.scrollHeight){
          GottaFetchEmAll();
        }
        
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    
    useEffect(()=>{
      if(localStorage.getItem('pageReloaded')){
        GottaFetchEmAllIntern();
      } else {
        localStorage.setItem('pageReloaded', 'true');
        localStorage.setItem('offset', "0");
        GottaFetchEmAll();
        
      }
    },[]);

    return (
        <div className="container">
          <div className="grid-container">
            {pokemonData.map((pokemon) => (
                <div key={pokemon.id} className="pokemon-card">
                    <span className="number">#{pokemon.id}</span>
                    <div className="image-container">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`} alt="Pokemon" className="pokemon-image"/>
                    </div>
                    <div className="name">
                        <h3>{pokemon.name}</h3>
                    </div>
                    <div className="stats">
                        <div className="stat">
                            <p className="stat-title">Experiencia</p>
                            <p className="stat-value">{pokemon.base_experience}</p>
                        </div>
                        <div className="stat">
                            <p className="stat-title">Peso</p>
                            <p className="stat-value">{pokemon.weight}</p>
                        </div>
                        <div className="stat">
                            <p className="stat-title">Altura</p>
                            <p className="stat-value">{pokemon.height}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <Loader/>
        </div>
        
    );
}

export default App;