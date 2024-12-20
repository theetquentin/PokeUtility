import { PokemonClient } from "pokenode-ts";
import { useEffect, useState } from "react";
import {
  AVAILABLE_LANGUAGES,
  POKEMON_GENERATIONS,
  TYPE_COLORS,
} from "../constants/pokemonConfig";
import { Pokemon } from "../interfaces/Pokemon";
import { PokemonSpecies } from "../interfaces/PokemonSpecies";
import { PokemonSprites } from "../interfaces/PokemonSprites";
import { TimeProps } from "../interfaces/TimeProps";
import { TypePokemon } from "../interfaces/TypePokemon";

function Pokedex({ timeOfDay }: TimeProps) {
  // États principaux
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("fr");
  const [typeTranslations, setTypeTranslations] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [selectedGeneration, setSelectedGeneration] = useState<number>(1);
  const [pokemonCache, setPokemonCache] = useState<{
    [key: number]: Pokemon[];
  }>({});

  useEffect(() => {
    const savedCache = localStorage.getItem("pokemonCache");
    if (savedCache) {
      setPokemonCache(JSON.parse(savedCache));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pokemonCache", JSON.stringify(pokemonCache));
  }, [pokemonCache]);

  useEffect(() => {
    const api = new PokemonClient();

    // Récupère les traductions pour tous les types de Pokémon
    const fetchTypeTranslations = async () => {
      const translations: { [key: string]: { [key: string]: string } } = {};

      await Promise.all(
        Object.keys(TYPE_COLORS).map(async (type) => {
          try {
            const typeData = await api.getTypeByName(type);
            translations[type] = Object.fromEntries(
              typeData.names.map((name) => [name.language.name, name.name])
            );
          } catch (error) {
            console.error(`Erreur traduction type ${type}:`, error);
          }
        })
      );

      return translations;
    };

    // Fonction principale de chargement des données
    const fetchPokemonData = async () => {
      try {
        setLoading(true);

        // Vérifier si les données sont déjà en cache
        if (pokemonCache[selectedGeneration]) {
          setPokemons(pokemonCache[selectedGeneration]);
          setLoading(false);
          return;
        }

        const generation = POKEMON_GENERATIONS[selectedGeneration];
        const [pokemonData, translations] = await Promise.all([
          Promise.all(
            Array.from(
              { length: generation.end - generation.start + 1 },
              async (_, i) => {
                try {
                  const pokemonId = generation.start + i;
                  const [pokemon, species] = await Promise.all([
                    api.getPokemonById(pokemonId),
                    api.getPokemonSpeciesById(pokemonId),
                  ]);

                  return {
                    name: pokemon.name,
                    id: pokemon.id,
                    sprites: {
                      front_default: pokemon.sprites.front_default,
                      front_shiny: pokemon.sprites.front_shiny,
                    } as PokemonSprites,
                    species: {
                      name: species.name,
                      names: species.names,
                    } as PokemonSpecies,
                    types: pokemon.types.map((type) => ({
                      type: {
                        name: type.type.name,
                      },
                    })) as TypePokemon[],
                  };
                } catch (error) {
                  console.error(
                    `Erreur Pokémon ${generation.start + i}:`,
                    error
                  );
                  return null;
                }
              }
            )
          ),
          fetchTypeTranslations(),
        ]);

        const filteredPokemonData = pokemonData.filter(
          (p): p is Pokemon => p !== null
        );

        // Mettre à jour le cache avec les nouvelles données
        setPokemonCache((prevCache) => ({
          ...prevCache,
          [selectedGeneration]: filteredPokemonData,
        }));

        setPokemons(filteredPokemonData);
        setTypeTranslations(translations);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [selectedGeneration, pokemonCache]);

  // Helpers pour la traduction
  const getPokemonName = (pokemon: Pokemon) =>
    pokemon.species?.names?.find(
      (name) => name.language.name === selectedLanguage
    )?.name ??
    pokemon.name ??
    "";

  const getTypeName = (typeName: string) =>
    typeTranslations[typeName]?.[selectedLanguage] ?? typeName;

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pokedex;
