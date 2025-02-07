import { PokemonClient, Pokemon, PokemonSpecies, Type, Name } from "pokenode-ts";
import { useEffect, useState } from "react";
import {
  AVAILABLE_LANGUAGES,
  POKEMON_GENERATIONS,
  TYPE_COLORS,
} from "../constants/pokemonConfig";
import { TimeProps } from "../interfaces/TimeProps";

// Extension de l'interface Pokemon pour inclure les cris
interface PokemonWithCries extends Pokemon {
  cries?: {
    latest: string;
  };
}

function Pokedex({ timeOfDay }: TimeProps) {
  // États pour les données des Pokémon
  const [pokemons, setPokemons] = useState<PokemonWithCries[]>([]); // Données de base des Pokémon (sprites, types, cris, etc.)
  const [pokemonSpecies, setPokemonSpecies] = useState<PokemonSpecies[]>([]); // Données des espèces (noms traduits, descriptions, etc.)
  
  // États pour l'interface utilisateur
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("fr");
  const [selectedGeneration, setSelectedGeneration] = useState<number>(1);
  
  // États pour les traductions
  const [typeTranslations, setTypeTranslations] = useState<{
    [key: string]: { [key: string]: string };
  }>({}); // Traductions des types pour chaque langue
  const [pokemonNames, setPokemonNames] = useState<{[key: number]: string}>({}); // Noms traduits des Pokémon
  const [allTypeData, setAllTypeData] = useState<{[key: string]: Type}>({}); // Données complètes des types

  // // État pour gérer l'audio en cours de lecture
  // const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);

  // Effet pour le chargement initial des données
  useEffect(() => {
    const api = new PokemonClient();

    /**
     * Charge les données par lots pour éviter de surcharger l'API
     * @param ids Liste des IDs de Pokémon à charger
     * @returns Liste des résultats (Pokémon + Espèces)
     */
    const fetchInBatches = async (ids: number[]) => {
      const batchSize = 200; // Nombre de requêtes simultanées
      const results = [];
      
      // Traitement par lots
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        // Chargement parallèle des Pokémon et de leurs espèces
        const batchResults = await Promise.all(
          batch.map(async (pokemonId) => {
            try {
              // Récupération directe depuis l'API pour avoir les cris
              const [pokemonResponse, species] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(res => res.json()),
                api.getPokemonSpeciesById(pokemonId)
              ]);
              return { pokemon: pokemonResponse as PokemonWithCries, species };
            } catch (error) {
              console.error(`Erreur Pokémon ${pokemonId}:`, error);
              return null;
            }
          })
        );
        results.push(...batchResults);
        
        // Pause entre les lots si nécessaire
        if (i + batchSize < ids.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      return results;
    };

    /**
     * Charge toutes les données nécessaires (Pokémon, espèces et types)
     */
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const generation = POKEMON_GENERATIONS[selectedGeneration];
        
        // Création de la liste des IDs pour la génération sélectionnée
        const pokemonIds = Array.from(
          { length: generation.end - generation.start + 1 },
          (_, i) => generation.start + i
        );

        // Chargement parallèle des Pokémon et des types
        const [pokemonResults, typeData] = await Promise.all([
          fetchInBatches(pokemonIds),
          Promise.all(Object.keys(TYPE_COLORS).map(type => api.getTypeByName(type)))
        ]);

        const filteredResults = pokemonResults.filter((r): r is { pokemon: PokemonWithCries, species: PokemonSpecies } => r !== null);
        
        // Organisation des données des types pour faciliter l'accès
        const typeDataMap = typeData.reduce((acc, type) => {
          acc[type.name] = type;
          return acc;
        }, {} as {[key: string]: Type});

        // Mise à jour de tous les états
        setAllTypeData(typeDataMap);
        setPokemons(filteredResults.map(r => r.pokemon));
        setPokemonSpecies(filteredResults.map(r => r.species));
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedGeneration]); // Recharge quand la génération change

  // Effet pour la gestion des traductions
  useEffect(() => {
    if (pokemonSpecies.length > 0 && Object.keys(allTypeData).length > 0) {
      // Traduction des types pour la langue sélectionnée
      const translations: { [key: string]: { [key: string]: string } } = {};
      Object.values(allTypeData).forEach(type => {
        translations[type.name] = Object.fromEntries(
          type.names.map((name: Name) => [name.language.name, name.name])
        );
      });
      setTypeTranslations(translations);

      // Traduction des noms de Pokémon pour la langue sélectionnée
      const newNames: {[key: number]: string} = {};
      pokemonSpecies.forEach(s => {
        newNames[s.id] = s.names.find(
          name => name.language.name === selectedLanguage
        )?.name || s.name;
      });
      setPokemonNames(newNames);
    }
  }, [selectedLanguage, pokemonSpecies, allTypeData]); // Met à jour quand la langue change

  // Helpers pour obtenir les noms traduits
  const getPokemonName = (pokemon: PokemonWithCries) =>
    pokemonNames[pokemon.id] ?? pokemon.name ?? "";

  const getTypeName = (typeName: string) =>
    typeTranslations[typeName]?.[selectedLanguage] ?? typeName;

  // Fonction pour jouer le cri d'un Pokémon
  // const playPokemonCry = (pokemon: PokemonWithCries) => {
  //   if (pokemon.cries?.latest) {
  //     // Arrêter le cri en cours s'il y en a un
  //     if (currentlyPlaying !== null) {
  //       const oldAudio = document.getElementById(`pokemon-cry-${currentlyPlaying}`) as HTMLAudioElement;
  //       if (oldAudio) {
  //         oldAudio.pause();
  //         oldAudio.currentTime = 0;
  //       }
  //     }

  //     // Jouer le nouveau cri
  //     const audio = document.getElementById(`pokemon-cry-${pokemon.id}`) as HTMLAudioElement;
  //     if (audio) {
  //       audio.play();
  //       setCurrentlyPlaying(pokemon.id);
  //       // Réinitialiser l'état une fois le cri terminé
  //       audio.onended = () => setCurrentlyPlaying(null);
  //     }
  //   }
  // };

  // Rendu principal
  return (
    <div className="container mx-auto px-20 py-8 relative z-10">
      {/* En-tête avec sélecteur de langue - toujours visible */}
      <div className="flex justify-between max-sm:flex-col max-sm:gap-3 mb-8">
        <h1
          className={`text-sm sm:text-xl md:text-3xl font-bold ${
            timeOfDay === "night" ? "text-gray-300" : "text-white"
          }`}
        >
          Pokédex
        </h1>
        <div className="flex max-lg:flex-col max-lg:items-end max-sm:items-start justify-center items-center gap-3">
          <select
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(Number(e.target.value))}
            disabled={loading}
            className={`rounded-lg px-3 py-2 text-xs sm:text-base ${
              timeOfDay === "night"
                ? "bg-gray-800 text-gray-200"
                : "bg-white/90 text-gray-800"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {POKEMON_GENERATIONS.map((gen) => (
              <option key={gen.id} value={gen.id}>
                {gen.label}
              </option>
            ))}
          </select>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={loading}
            className={`rounded-lg px-3 py-2 text-xs sm:text-base ${
              timeOfDay === "night"
                ? "bg-gray-800 text-gray-200"
                : "bg-white/90 text-gray-800"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p
            className={`text-2xl ${
              timeOfDay === "night" ? "text-gray-300" : "text-white"
            }`}
          >
            Chargement des Pokémon...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className={`rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow ${
                timeOfDay === "night"
                  ? "bg-gray-800/90 text-gray-200"
                  : "bg-white/70 text-gray-800"
              }`}
            >
              <img
                src={pokemon.sprites?.front_default ?? "/default-pokemon.png"}
                alt={getPokemonName(pokemon)}
                className="w-32 h-32 mx-auto"
              />
              <h2 className="text-center capitalize font-semibold mt-2">
                {getPokemonName(pokemon)}
              </h2>
              <p
                className={`text-center mb-2 ${
                  timeOfDay === "night" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                #{pokemon.id}
              </p>
              <div className="flex justify-center gap-2">
                {pokemon.types?.map((type) => (
                  <span
                    key={type.type?.name}
                    className={`${
                      TYPE_COLORS[type.type?.name ?? ""]
                    } text-white px-2 py-1 rounded-full text-xs`}
                  >
                    {getTypeName(type.type?.name ?? "")}
                  </span>
                ))}
              </div>
              {/* {pokemon.cries?.latest && (
                <>
                  <audio
                    id={`pokemon-cry-${pokemon.id}`}
                    src={pokemon.cries.latest}
                    preload="none"
                  />
                  <button
                    onClick={() => playPokemonCry(pokemon)}
                    disabled={currentlyPlaying === pokemon.id}
                    className={`w-full px-2 py-1 rounded ${
                      timeOfDay === "night"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    } transition-colors ${
                      currentlyPlaying === pokemon.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {currentlyPlaying === pokemon.id ? "♪ ..." : "♪ Cri"}
                  </button>
                </>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pokedex;
