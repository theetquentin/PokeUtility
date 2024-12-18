import { useState, useEffect } from 'react';
import { PokemonClient } from 'pokenode-ts';
import { Pokemon } from '../interfaces/Pokemon';
import { TYPE_COLORS, AVAILABLE_LANGUAGES } from '../constants/pokemonConfig';
import { PokemonSprites } from '../interfaces/PokemonSprites';
import { PokemonSpecies } from '../interfaces/PokemonSpecies';
import { TypePokemon } from '../interfaces/TypePokemon';
import { TimeProps } from '../interfaces/TimeProps';

function Pokedex({ timeOfDay }: TimeProps) {
  // États principaux
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
  const [typeTranslations, setTypeTranslations] = useState<{ [key: string]: { [key: string]: string } }>({});

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
              typeData.names.map(name => [name.language.name, name.name])
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
        setPokemons([]); // Reset pour éviter les doublons

        // Chargement parallèle des Pokémon et des traductions
        const [pokemonData, translations] = await Promise.all([
          // Chargement des 151 premiers Pokémon
          Promise.all(
            Array.from({ length: 151 }, async (_, i) => {
              try {
                const [pokemon, species] = await Promise.all([
                  api.getPokemonById(i + 1),
                  api.getPokemonSpeciesById(i + 1)
                ]);

                return {
                  name: pokemon.name,
                  id: pokemon.id,
                  sprites: {
                    front_default: pokemon.sprites.front_default,
                    front_shiny: pokemon.sprites.front_shiny
                  } as PokemonSprites,
                  species: {
                    name: species.name,
                    names: species.names
                  } as PokemonSpecies,
                  types: pokemon.types.map(type => ({
                    type: {
                      name: type.type.name
                    }
                  })) as TypePokemon[]
                };
              } catch (error) {
                console.error(`Erreur Pokémon ${i + 1}:`, error);
                return null;
              }
            })
          ),
          fetchTypeTranslations()
        ]);

        // Mise à jour des états avec les données récupérées
        setPokemons(pokemonData.filter((p): p is Pokemon => p !== null));
        setTypeTranslations(translations);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, []);

  // Helpers pour la traduction
  const getPokemonName = (pokemon: Pokemon) => 
    pokemon.species?.names?.find(name => name.language.name === selectedLanguage)?.name 
    ?? pokemon.name 
    ?? '';

  const getTypeName = (typeName: string) => 
    typeTranslations[typeName]?.[selectedLanguage] 
    ?? typeName;

  // Affichage du loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className={`text-2xl ${timeOfDay === 'night' ? 'text-gray-300' : 'text-white'}`}>
          Chargement des Pokémon...
        </p>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* En-tête avec sélecteur de langue */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${timeOfDay === 'night' ? 'text-gray-300' : 'text-white'}`}>
          Pokédex
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`rounded-lg px-4 py-2 ${
              timeOfDay === 'night' ? 'bg-gray-800 text-gray-200' : 'bg-white/90 text-gray-800'
            }`}
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des Pokémon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {pokemons.map(pokemon => (
          <div
            key={pokemon.id}
            className={`rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow ${
              timeOfDay === 'night' ? 'bg-gray-800/90 text-gray-200' : 'bg-white/90 text-gray-800'
            }`}
          >
            <img
              src={pokemon.sprites?.front_default ?? '/default-pokemon.png'}
              alt={getPokemonName(pokemon)}
              className="w-32 h-32 mx-auto"
            />
            <h2 className="text-center capitalize font-semibold mt-2">
              {getPokemonName(pokemon)}
            </h2>
            <p className={`text-center mb-2 ${
              timeOfDay === 'night' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              #{pokemon.id}
            </p>
            <div className="flex justify-center gap-2">
              {pokemon.types?.map(type => (
                <span
                  key={type.type?.name}
                  className={`${TYPE_COLORS[type.type?.name ?? '']} text-white px-2 py-1 rounded-full text-xs`}
                >
                  {getTypeName(type.type?.name ?? '')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pokedex;