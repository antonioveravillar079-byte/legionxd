import React, { useState, useEffect } from 'react';
import { Shield, Users, Trophy, Star, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  setCurrentView: (view: string) => void;
  isAuthenticated: boolean;
}

export function Home({ setCurrentView, isAuthenticated }: HomeProps) {
  const navigate = useNavigate();
  const [showJoinAlert, setShowJoinAlert] = useState(false);

  useEffect(() => {
    if (showJoinAlert) {
      const timeout = setTimeout(() => setShowJoinAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [showJoinAlert]);

  const handleJoinClick = () => {
    setShowJoinAlert(true);
  };

  const videoId = "SSxqdbcpyIg";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-[90vh] flex items-center justify-center">

        {/* YouTube Video Background */}
        <div className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2">
          <iframe
            className="w-screen h-screen"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&modestbranding=1&playlist=${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              transform: 'scale(1.5)',
            }}
          ></iframe>
        </div>

        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <Shield className="h-28 w-28 text-red-500 drop-shadow-xl animate-pulse-slow" />
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight leading-none">
            Nova Dark <span className="text-red-500">Legion</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto font-light">
            Únete a nuestra legión imparable y forja tu leyenda. Dominamos cada juego, cada arena, cada batalla.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center relative">
            {!isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={handleJoinClick}
                    className="inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl group"
                  >
                    Únete Ahora
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </button>
                  {showJoinAlert && (
                    <div className="absolute z-50 top-full mt-4 left-1/2 -translate-x-1/2 sm:top-1/2 sm:mt-0 sm:ml-4 sm:left-full sm:-translate-x-0 sm:-translate-y-1/2 w-80 bg-red-800 text-white rounded-xl p-4 shadow-2xl flex items-center justify-between animate-fade-in">
                      <span>Los ingresos están cerrados. ¡Estate atento!</span>
                      <button onClick={() => setShowJoinAlert(false)}>
                        <X className="h-5 w-5 text-white/80 hover:text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/rules')}
                  className="inline-flex items-center px-10 py-4 text-lg font-bold text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Ver Reglas
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('application')}
                  className="inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl group"
                >
                  Solicitar Ingreso
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setCurrentView('raffles')}
                  className="inline-flex items-center px-10 py-4 text-lg font-bold text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Ver Sorteos
                  <Trophy className="ml-2 h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Por qué unirte a Nova Dark Legion?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Más que un clan, somos una comunidad forjada en la victoria, la lealtad y el respeto mutuo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-red-500" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Comunidad Élite</h3>
                <p className="text-gray-400 text-center">
                  Más de 0 miembros activos, unidos por una pasión por el gaming competitivo y cooperativo.
                </p>
              </div>
            </div>
            <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-red-500" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Sorteos de Valor</h3>
                <p className="text-gray-400 text-center">
                  Participa en sorteos exclusivos con premios increíbles, desde Robux hasta items raros de tus juegos favoritos.
                </p>
              </div>
            </div>
            <div className="relative bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-red-500" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Eventos Exclusivos</h3>
                <p className="text-gray-400 text-center">
                  Acceso prioritario a torneos, eventos y actividades privadas diseñadas para los miembros más leales del clan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold text-red-500 mb-2">0+</div>
              <div className="text-gray-400 text-sm md:text-base">Miembros Activos</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-red-500 mb-2">0+</div>
              <div className="text-gray-400 text-sm md:text-base">Sorteos Realizados</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-red-500 mb-2">24/7</div>
              <div className="text-gray-400 text-sm md:text-base">Soporte y Liderazgo</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-red-500 mb-2">0+</div>
              <div className="text-gray-400 text-sm md:text-base">Años de Existencia</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¡Tu aventura épica empieza ahora!
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Únete a la legión y demuestra tu valía. La gloria nos espera.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => setCurrentView('auth')}
              className="inline-flex items-center px-10 py-4 text-lg font-bold text-red-600 bg-white hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl group"
            >
              Registrarse Ahora
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}