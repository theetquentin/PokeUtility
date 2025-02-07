import { PokemonWithCries } from "../pages/Pokedex";
import { TYPE_COLORS } from "../constants/pokemonConfig";
import { PokemonType, PokemonAbility, PokemonStat, PokemonSpecies } from "pokenode-ts";
import { useState } from "react";

interface PokemonModalProps {
  pokemon: PokemonWithCries;
  isOpen: boolean;
  onClose: () => void;
  getPokemonName: (pokemon: PokemonWithCries) => string;
  getTypeName: (typeName: string) => string;
  timeOfDay: "day" | "night";
  species: PokemonSpecies | undefined;
  selectedLanguage: string;
}

function PokemonModal({ 
  pokemon, 
  isOpen, 
  onClose, 
  getPokemonName, 
  getTypeName, 
  timeOfDay,
  species,
  selectedLanguage 
}: PokemonModalProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<boolean>(false);

  if (!isOpen) return null;

  const description = species?.flavor_text_entries.find(
    entry => entry.language.name === selectedLanguage
  )?.flavor_text.replace(/\f/g, ' ');

  const playPokemonCry = () => {
    if (pokemon.cries?.latest && !currentlyPlaying) {
      const audio = new Audio(pokemon.cries.latest);
      setCurrentlyPlaying(true);
      audio.play();
      audio.onended = () => setCurrentlyPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div 
        className={`relative max-w-4xl w-full p-6 rounded-lg shadow-xl my-8 ${
          timeOfDay === "night" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Contenu */}
        <div className="flex flex-col items-center space-y-6 w-full max-w-3xl mx-auto">
          {/* En-tête */}
          <div className="flex flex-col items-center w-full">
            <img
              src={pokemon.sprites.other?.["official-artwork"].front_default || pokemon.sprites.front_default || "/default-pokemon.png"}
              alt={getPokemonName(pokemon)}
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
            />
            <div className="flex items-center gap-2 mt-4">
              <div className="flex flex-wrap justify-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {getPokemonName(pokemon)}
                <span className="text-gray-500 text-xl sm:text-2xl ml-2">#{pokemon.id}</span>
              </h2>
              {pokemon.cries?.latest && (
                <button
                  onClick={playPokemonCry}
                  disabled={currentlyPlaying}
                  className={`p-1 my-2 rounded-lg ${
                    timeOfDay === "night"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors ${
                    currentlyPlaying ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {currentlyPlaying ? "♪ ..." : "Cri ♪"}
                </button>
              )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">

              {pokemon.types.map((type: PokemonType) => (
                <span
                  key={type.type.name}
                  className={`${TYPE_COLORS[type.type.name]} text-white px-3 py-1 rounded-full`}
                >
                  {getTypeName(type.type.name)}
                </span>
              ))}
            </div>
            {description && (
              <p className="mt-4 text-center max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {/* Informations de base */}
          <div className="flex flex-col sm:flex-row justify-center gap-12 w-full">
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-3">Caractéristiques</h3>
              <div className="space-y-2 text-center">
                <p>Taille: {pokemon.height / 10}m</p>
                <p>Poids: {pokemon.weight / 10}kg</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-3">Talent(s)</h3>
              <div className="space-y-2 text-center">
                {pokemon.abilities.map((ability: PokemonAbility) => (
                  <p key={ability.ability.name} className="capitalize">
                    {ability.ability.name.replace("-", " ")}
                    {ability.is_hidden && " (Caché)"}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="w-full max-w-xl">
            <h3 className="font-semibold text-lg mb-3 text-center">Statistiques</h3>
            <div className="space-y-3">
              {pokemon.stats.map((stat: PokemonStat) => (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">{stat.stat.name.replace("-", " ")}</span>
                    <span>{stat.base_stat}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprites */}
          <div className="w-full">
            <h3 className="font-semibold text-lg mb-3 text-center">Sprites</h3>
            <div className="flex flex-wrap justify-center gap-8">
              {pokemon.sprites.front_default && (
                <div className="text-center">
                  <img
                    src={pokemon.sprites.front_default}
                    alt="Front Default"
                    className="w-20 h-20"
                  />
                  <span className="text-sm">Normal</span>
                </div>
              )}
              {pokemon.sprites.back_default && (
                <div className="text-center">
                  <img
                    src={pokemon.sprites.back_default}
                    alt="Back Default"
                    className="w-20 h-20"
                  />
                  <span className="text-sm">Dos</span>
                </div>
              )}
              {pokemon.sprites.front_shiny && (
                <div className="text-center">
                  <img
                    src={pokemon.sprites.front_shiny}
                    alt="Front Shiny"
                    className="w-20 h-20"
                  />
                  <span className="text-sm">Shiny</span>
                </div>
              )}
              {pokemon.sprites.back_shiny && (
                <div className="text-center">
                  <img
                    src={pokemon.sprites.back_shiny}
                    alt="Back Shiny"
                    className="w-20 h-20"
                  />
                  <span className="text-sm">Shiny Dos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonModal; 