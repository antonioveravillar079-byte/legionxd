import React from 'react';
import { Shield, Users, Trophy, MessageSquare, AlertTriangle, Ban } from 'lucide-react';

export function Rules() {
  const ruleCategories = [
    {
      icon: Shield,
      title: 'Reglas Generales',
      color: 'text-red-500',
      rules: [
        'Respeta a todos los miembros del clan sin excepción',
        'No se permite el spam o flood en ningún chat',
        'Mantén un lenguaje apropiado en todo momento',
        'No compartas información personal de otros miembros',
        'Sigue las instrucciones de los administradores y moderadores'
      ]
    },
    {
      icon: Users,
      title: 'Comportamiento en Juegos',
      color: 'text-yellow-400',
      rules: [
        'No hagas trampa o uses exploits en ningún juego',
        'Ayuda a otros miembros cuando sea posible',
        'Representa al clan con honor y deportividad',
        'No abandones partidas grupales sin avisar',
        'Participa activamente en eventos del clan'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Comunicación',
      color: 'text-blue-500',
      rules: [
        'Usa los canales apropiados para cada tipo de conversación',
        'No envíes mensajes irrelevantes o fuera de tema',
        'Evita discusiones políticas o religiosas',
        'No promociones contenido externo sin autorización',
        'Reporta comportamiento inapropiado a los moderadores'
      ]
    },
    {
      icon: Trophy,
      title: 'Sorteos y Eventos',
      color: 'text-green-500',
      rules: [
        'Solo puedes participar una vez por sorteo',
        'No uses cuentas alternativas para participar',
        'Respeta los resultados de todos los sorteos',
        'Participa activamente en eventos del clan',
        'No solicites premios adicionales'
      ]
    }
  ];

  const violations = [
    {
      severity: 'Advertencia',
      color: 'border-yellow-400 text-yellow-400',
      actions: ['Spam leve', 'Lenguaje inapropiado menor', 'Incumplimiento menor de reglas']
    },
    {
      severity: 'Suspensión Temporal',
      color: 'border-orange-500 text-orange-500',
      actions: ['Comportamiento tóxico', 'Desobediencia a moderadores', 'Múltiples advertencias']
    },
    {
      severity: 'Expulsión Permanente',
      color: 'border-red-500 text-red-500',
      actions: ['Acoso o bullying', 'Uso de cheats/hacks', 'Comportamiento extremadamente tóxico']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6 animate-fade-in">
            <Shield className="h-20 w-20 text-red-600 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter animate-slide-in-top">
            Código de Honor
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
            Para mantener un ambiente saludable y divertido para todos, es esencial que los miembros de nuestro clan respeten estas reglas.
          </p>
        </header>

        {/* Important Notice */}
        <div className="relative bg-gray-900 border border-red-600 rounded-xl p-8 mb-16 shadow-lg transform transition-transform hover:scale-105">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 p-3 rounded-full shadow-xl">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div className="text-center mt-4">
            <h3 className="text-2xl font-bold text-red-500 mb-3">
              Importante: Lectura Obligatoria
            </h3>
            <p className="text-gray-300 leading-relaxed">
              El desconocimiento de las reglas no exime de su cumplimiento. Las violaciones pueden resultar en advertencias, suspensiones temporales o expulsión permanente del clan.
            </p>
          </div>
        </div>

        {/* Rule Categories */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {ruleCategories.map(({ icon: Icon, title, color, rules }, idx) => (
            <div
              key={idx}
              className="bg-gray-900 rounded-xl p-8 shadow-xl border border-gray-800 hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full mr-5 bg-gray-800 transition-colors ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-wide">
                  {title}
                </h3>
              </div>
              <ul className="space-y-4">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-red-500 mr-4 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="text-gray-400 leading-relaxed">{rule}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Violations and Consequences */}
        <section className="bg-gray-900 rounded-xl p-10 shadow-2xl border border-gray-800">
          <div className="flex items-center mb-10 justify-center">
            <div className="bg-gray-800 p-3 rounded-full mr-5 shadow-inner">
              <Ban className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Violaciones y Consecuencias
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {violations.map(({ severity, color, actions }, idx) => (
              <div
                key={idx}
                className={`bg-gray-800 rounded-xl p-6 shadow-lg border-2 ${color} transform transition-transform hover:scale-105`}
              >
                <h4 className="text-2xl font-bold mb-4">{severity}</h4>
                <ul className="space-y-3">
                  {actions.map((action, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-gray-300 font-medium">{action}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Information */}
        <div className="bg-gray-900 rounded-xl p-10 text-center mt-20 shadow-2xl border border-gray-800">
          <h3 className="text-3xl font-extrabold text-white mb-6 tracking-wide">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed text-lg">
            Si tienes dudas sobre las reglas o necesitas reportar un comportamiento inapropiado, no dudes en contactar a nuestros moderadores o administradores.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="#"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full tracking-wide transition-colors transform hover:scale-105"
            >
              Contactar en Discord
            </a>
            <a
              href="#"
              className="inline-block px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full tracking-wide transition-colors transform hover:scale-105"
            >
              Abrir un Ticket
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}