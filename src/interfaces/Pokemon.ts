import { PokemonSprites } from './PokemonSprites';
import { PokemonSpecies } from './PokemonSpecies';
import { TypePokemon } from './TypePokemon';

export interface Pokemon {
  name: string;
  id: number;
  sprites: PokemonSprites;
  species: PokemonSpecies;
  types: TypePokemon[];
} 