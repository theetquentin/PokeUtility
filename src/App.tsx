import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import bikeBoy from "./assets/bike_boy.gif";
import bikeGirl from "./assets/bike_girl.gif";
import Latias from "./assets/latias.png";
import Latios from "./assets/latios.png";
import { TimeProps } from "./interfaces/TimeProps";
import Home from "./pages/Home";
import Pokedex from "./pages/Pokedex";

function App() {
  // États pour le temps et les sprites
  const [timeOfDay, setTimeOfDay] = useState<TimeProps["timeOfDay"]>("day");
  const [bikeSprite, setBikeSprite] = useState<string>(bikeBoy);
  const [pokemonSprite, setPokemonSprite] = useState<string>(Latios);

  useEffect(() => {
    // Vérification de l'heure pour jour/nuit
    const checkTime = () => {
      const hours = new Date().getHours();
      setTimeOfDay(hours >= 6 && hours < 18 ? "day" : "night");
    };

    // Sélection aléatoire des sprites
    const randomBike = Math.random() < 0.5 ? bikeBoy : bikeGirl;
    const randomPokemon = Math.random() < 0.5 ? Latios : Latias;
    setBikeSprite(randomBike);
    setPokemonSprite(randomPokemon);

    // Initialisation et intervalle de vérification du temps
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen background-${timeOfDay}`}>
      {/* Conteneur pour les sprites animés */}
      <div className="fixed inset-0 pointer-events-none">
        <img
          src={bikeSprite}
          alt="Bike Sprite"
          className="bike select-none"
          style={{
            filter: timeOfDay === "night" ? "brightness(0.7)" : "none",
          }}
        />
        <img
          src={pokemonSprite}
          alt="Pokemon Sprite"
          className="selectedPokemon"
          style={{
            filter: timeOfDay === "night" ? "brightness(0.7)" : "none",
          }}
        />
      </div>
      {/* Contenu principal */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex timeOfDay={timeOfDay} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
