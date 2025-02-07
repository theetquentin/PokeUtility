import { Language } from "../interfaces/Language";

export const TYPE_COLORS: { [key: string]: string } = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

export const POKEMON_GENERATIONS = [
  { id: 0, label: "Tous", start: 1, end: 1025 },
  { id: 1, label: "Génération 1", start: 1, end: 151 },
  { id: 2, label: "Génération 2", start: 152, end: 251 },
  { id: 3, label: "Génération 3", start: 252, end: 386 },
  { id: 4, label: "Génération 4", start: 387, end: 493 },
  { id: 5, label: "Génération 5", start: 494, end: 649 },
  { id: 6, label: "Génération 6", start: 650, end: 721 },
  { id: 7, label: "Génération 7", start: 722, end: 809 },
  { id: 8, label: "Génération 8", start: 810, end: 905 },
  { id: 9, label: "Génération 9", start: 906, end: 1025 },
];
