import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Award, AlertCircle, Sparkles, XCircle, CheckCircle } from 'lucide-react'; // Added CheckCircle for success message
import { useApp } from '../contexts/AppContext';

export function Raffles() {
  const { state, dispatch } = useApp();
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null); // Added local error state

  const currentUser = state.auth.currentUser;
  const activeRaffles = state.raffles.filter(raffle => raffle.isActive);
  const completedRaffles = state.raffles.filter(raffle => !raffle.isActive);

  // Timer for active raffles
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining: Record<string, string> = {};
      
      activeRaffles.forEach(raffle => {
        const now = new Date().getTime();
        const endTime = new Date(raffle.endDate).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          newTimeRemaining[raffle.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeRemaining[raffle.id] = 'Finalizado';
          // Optionally, dispatch an action here to mark raffle as inactive if it's dynamic
        }
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRaffles]);

  // Handle joining a raffle
  const handleJoinRaffle = (raffleId: string) => {
    setLocalError(null); // Clear previous error
    if (!currentUser) {
      console.warn("User not logged in. Cannot join raffle.");
      setLocalError("Debes iniciar sesión para unirte a los sorteos.");
      return;
    }

    const raffle = state.raffles.find(r => r.id === raffleId);
    if (!raffle) {
      console.warn("Raffle not found.");
      setLocalError("El sorteo no se encontró o ya no está disponible.");
      return;
    }
    if (raffle.participants.includes(currentUser.id)) {
      console.warn("User already participating.");
      setLocalError("¡Ya estás participando en este sorteo!");
      return;
    }

    try {
      dispatch({ 
        type: 'JOIN_RAFFLE', 
        payload: { raffleId, userId: currentUser.id } 
      });
      // A small delay to show feedback if needed, but not critical for blank page fix
    } catch (e) {
      console.error("Error joining raffle:", e);
      setLocalError("Ocurrió un error al intentar unirte al sorteo. Por favor, inténtalo de nuevo.");
    }
  };

  // Check if current user is participating in a raffle
  const isUserParticipating = (raffleId: string) => {
    if (!currentUser) return false;
    const raffle = state.raffles.find(r => r.id === raffleId);
    return raffle?.participants.includes(currentUser.id) || false;
  };

  // Get user details by ID
  const getUserById = (userId: string) => {
    return state.users.find(user => user.id === userId);
  };

  // Display message if user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-red-600 p-8 text-center shadow-2xl animate-fade-in">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-300 text-lg">
            Debes iniciar sesión para ver y participar en los sorteos del clan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Sorteos del Clan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Participa en sorteos exclusivos y gana increíbles premios. ¡La fortuna favorece a los audaces!
          </p>
        </div>

        {/* Local Error Display */}
        {localError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-8 flex items-center justify-center animate-fade-in">
            <XCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-300 font-medium text-center">{localError}</p>
          </div>
        )}

        {/* Active Raffles Section */}
        {activeRaffles.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-red-500 mr-3 animate-bounce-slow" />
              Sorteos Activos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeRaffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="bg-gray-900 rounded-xl border border-red-600 overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-red-700/50"
                >
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {raffle.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {raffle.description}
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-lg text-gray-400">
                        <Clock className="h-5 w-5 text-red-400 mr-3" />
                        <span className="font-semibold">Tiempo restante: </span>
                        <span className="ml-2 text-white">{timeRemaining[raffle.id] || 'Calculando...'}</span>
                      </div>
                      
                      <div className="flex items-center text-lg text-gray-400">
                        <Users className="h-5 w-5 text-red-400 mr-3" />
                        <span className="font-semibold">Participantes: </span>
                        <span className="ml-2 text-white">{raffle.participants.length}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      {isUserParticipating(raffle.id) ? (
                        <div className="bg-green-700 text-white text-center py-3 px-6 rounded-lg font-bold flex items-center justify-center shadow-lg">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          ¡Ya estás participando!
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoinRaffle(raffle.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group"
                        >
                          Participar ahora
                          <Sparkles className="h-5 w-5 ml-2 transition-transform group-hover:rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Participants preview section */}
                  {raffle.participants.length > 0 && (
                    <div className="bg-gray-800 px-8 py-5 border-t border-gray-700">
                      <h4 className="text-md font-medium text-gray-300 mb-3">
                        Participantes inscritos:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {raffle.participants.slice(0, 5).map((participantId) => {
                          const user = getUserById(participantId);
                          return (
                            <span
                              key={participantId}
                              className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full shadow-sm"
                            >
                              {user?.username || 'Usuario Desconocido'}
                            </span>
                          );
                        })}
                        {raffle.participants.length > 5 && (
                          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full shadow-sm">
                            +{raffle.participants.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Raffles Section */}
        {completedRaffles.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-10 flex items-center justify-center">
              <Award className="h-8 w-8 text-yellow-500 mr-3" />
              Sorteos Completados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedRaffles.map((raffle) => {
                const winner = raffle.winner ? getUserById(raffle.winner) : null;
                return (
                  <div
                    key={raffle.id}
                    className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-md opacity-80"
                  >
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {raffle.title}
                      </h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {raffle.description}
                      </p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-lg text-gray-400">
                          <Users className="h-5 w-5 text-gray-500 mr-3" />
                          <span className="font-semibold">Participantes: </span>
                          <span className="ml-2 text-white">{raffle.participants.length}</span>
                        </div>
                        
                        {winner && (
                          <div className="bg-yellow-800/20 border border-yellow-700 rounded-lg p-4 flex items-center shadow-inner">
                            <Award className="h-6 w-6 text-yellow-500 mr-3" />
                            <div>
                              <span className="font-bold text-yellow-400 text-lg">Ganador: </span>
                              <span className="text-white text-lg">{winner.username}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                     {/* Participants preview section for completed raffles */}
                    {raffle.participants.length > 0 && (
                      <div className="bg-gray-800 px-8 py-5 border-t border-gray-700">
                        <h4 className="text-md font-medium text-gray-300 mb-3">
                          Participantes:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {raffle.participants.slice(0, 5).map((participantId) => {
                            const user = getUserById(participantId);
                            return (
                              <span
                                key={participantId}
                                className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full shadow-sm"
                              >
                                {user?.username || 'Usuario Desconocido'}
                              </span>
                            );
                          })}
                          {raffle.participants.length > 5 && (
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full shadow-sm">
                              +{raffle.participants.length - 5} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Raffles Message */}
        {activeRaffles.length === 0 && completedRaffles.length === 0 && (
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 shadow-xl animate-fade-in">
            <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-6 drop-shadow-lg" />
            <h3 className="text-3xl font-bold text-gray-400 mb-4">
              ¡Nada por aquí, por ahora!
            </h3>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              Los sorteos exclusivos del clan aparecerán aquí cuando nuestros administradores los lancen. ¡Mantente atento para no perderte tu oportunidad de ganar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
