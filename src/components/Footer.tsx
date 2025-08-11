import React from 'react';
import { Shield, Users, Trophy, MessageSquare, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Discord', url: '#', icon: MessageSquare },
    { name: 'Grupo Roblox', url: '#', icon: Users },
    { name: 'YouTube', url: '#', icon: ExternalLink },
  ];

  const quickLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Reglas', href: '#' },
    { name: 'Sorteos', href: '#' },
    { name: 'Solicitar Ingreso', href: '#' },
  ];

  return (
    <footer className="bg-black border-t border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-2xl font-bold text-white">Nova Dark Legion</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              El clan más poderoso de Roblox. Únete a nuestra legión y forma parte de una 
              comunidad activa de más de 0 miembros dispuestos a conquistar cualquier desafío.
            </p>
            <div className="flex items-center space-x-6">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={link.name}
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-400">0+ Miembros</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-400">0+ Sorteos</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-gray-400">0+ Años Activos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Nova Dark Legion. Todos los derechos reservados.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Hecho por PancaPlay</span>
              <Heart className="h-4 w-4 text-red-500 mx-1" />
              <span>para la Legion.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Efecto de gradiente en la parte inferior */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
    </footer>
  );
}