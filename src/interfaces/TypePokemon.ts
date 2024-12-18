export interface TypePokemon {
  type: {
    name: string;
    names?: {
      language: { name: string };
      name: string;
    }[];
  };
} 