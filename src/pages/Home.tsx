import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


function Home() {
  const navigate = useNavigate();
  // État pour gérer l'heure actuelle
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Mise à jour de l'heure toutes les secondes
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Nettoyage du timer lors du démontage du composant
    return () => clearInterval(timer);
  }, []); // Tableau de dépendances vide = exécution uniquement au montage

  // Formatage de l'heure au format français (24h)
  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      {/* Éléments de l'interface au premier plan */}
      <img 
        src="/logo_pokemon.png" 
        alt="Pokemon Logo" 
        className="w-1/4 mb-4"
      />
      <h1 
        className="text-4xl font-bold mb-8"
        style={{ 
          color: '#f2c304',
          textShadow: '2px 2px 4px #2c62aa'
        }}
      >
        {formattedTime}
      </h1>
      <button
        onClick={() => navigate('/pokedex')}
        className="border-4 border-black rounded-full px-8 py-3 font-bold relative overflow-hidden transform transition hover:scale-105"
        style={{
          background: 'linear-gradient(to bottom, #ff0000 50%, white 50%)',
        }}
      >
        Pokédex
      </button>
    </div>
  );
}

export default Home;