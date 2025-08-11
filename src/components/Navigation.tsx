import React, { useState } from 'react';
import { Shield, Users, Trophy, FileText, LogOut, Home, Menu, UserCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const { state, dispatch } = useApp();
  const { auth } = state;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    setMobileOpen(false);
  };

  let navItems = [ // Usamos let para poder modificarlo
    { id: '/', label: 'Inicio', icon: Home, public: true },
    { id: '/rules', label: 'Reglas', icon: FileText, public: true },
    { id: '/tickets', label: 'Tickets', icon: MessageSquare, public: false },
    { id: '/application', label: 'Solicitar Ingreso', icon: Users, public: false },
    { id: '/raffles', label: 'Sorteos', icon: Trophy, public: false },
  ];

  const scrollbarStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#b91c1c #1f2937',
  };

  return (
    <nav className="bg-gray-900 border-b-2 border-red-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 sm:h-24 lg:h-28">
          <div className="flex-shrink-0 flex items-center h-full">
            <Link to="/">
              <img
                src="https://i.ibb.co/NdSPDwmD/logolegion.png"
                alt="Nova Dark Legion Logo"
                className="h-full max-h-16 sm:max-h-20 lg:max-h-24 w-auto object-contain transition-all duration-300 transform hover:scale-105"
                style={{ minHeight: '3rem' }}
              />
            </Link>
          </div>

          <div
            className="hidden md:flex flex-nowrap overflow-x-auto space-x-8 mx-6 flex-grow"
            style={scrollbarStyle}
          >
            {navItems.map((item) => {
              if (!item.public && !auth.isAuthenticated) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`inline-flex items-center px-4 py-2 text-base font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    location.pathname === item.id
                      ? 'bg-red-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {auth.isAuthenticated ? (
              <div className="relative group"> {/* Contenedor para el dropdown */}
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl shadow-lg border border-red-700 cursor-pointer transition-all duration-300 hover:scale-[1.02]">
                  <UserCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm text-gray-300">Hola,</span>
                    <span className="font-extrabold text-white text-lg">
                      {auth.currentUser?.username}
                    </span>
                  </div>
                  {auth.currentUser?.isAdmin && (
                    <div className="ml-3 inline-flex items-center px-3 py-1 text-sm font-bold bg-red-600 text-white rounded-full border border-red-400 shadow-md">
                      <Shield className="h-4 w-4 mr-1.5" />
                      ADMIN
                    </div>
                  )}
                </div>
                {/* Menú desplegable */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 origin-top-right border border-red-700">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center transition-colors duration-200"
                  >
                    <Users className="h-4 w-4 mr-2" /> Mi Perfil
                  </Link>
                  {auth.currentUser?.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center transition-colors duration-200"
                    >
                      <Shield className="h-4 w-4 mr-2" /> Administración
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-700 hover:text-white flex items-center transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-2 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-red-600 hover:text-red-400 ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            <Menu className="h-8 w-8" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 bg-gray-900 rounded-b-lg shadow-xl p-4 space-y-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-2">
            {auth.isAuthenticated && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg shadow-inner border border-red-700">
                <UserCircle className="h-7 w-7 text-red-600 flex-shrink-0" />
                <div className="flex flex-col items-start leading-tight flex-grow">
                  <span className="text-sm text-gray-300">Hola,</span>
                  <span className="font-bold text-white text-base">
                    {auth.currentUser?.username}
                  </span>
                </div>
                {auth.currentUser?.isAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    ADMIN
                  </span>
                )}
              </div>
            )}
            {navItems.map((item) => {
              if (!item.public && !auth.isAuthenticated) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    location.pathname === item.id
                      ? 'bg-red-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            {auth.currentUser?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    location.pathname === '/admin'
                      ? 'bg-red-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" /> Administración
                </Link>
            )}
            {auth.isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  location.pathname === '/profile'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Users className="h-4 w-4 mr-2" /> Mi Perfil
              </Link>
            )}

            {!auth.isAuthenticated && (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Link>
            )}
            {auth.isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors whitespace-nowrap"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}