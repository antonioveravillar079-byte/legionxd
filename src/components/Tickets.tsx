import React, { useState } from 'react';
import { Ticket, MessageSquare, Plus, Clock, AlertCircle, CheckCircle, X, Send, User, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Ticket as TicketType, TicketResponse } from '../types';

export function Tickets() {
  const { state, dispatch } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const currentUser = state.auth.currentUser;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-red-600 p-8 text-center shadow-2xl animate-fade-in">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-300 text-lg">
            Debes iniciar sesión para acceder al sistema de tickets.
          </p>
        </div>
      </div>
    );
  }

  const userTickets = state.tickets?.filter(ticket => ticket.userId === currentUser.id) || [];

  const handleCreateTicket = () => {
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) return;

    const newTicket: TicketType = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: ticketForm.title,
      description: ticketForm.description,
      status: 'open',
      priority: ticketForm.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };

    dispatch({ type: 'CREATE_TICKET', payload: newTicket });
    setTicketForm({ title: '', description: '', priority: 'medium' });
    setShowCreateForm(false);
  };

  const handleAddResponse = () => {
    if (!selectedTicket || !newResponse.trim()) return;

    const response: TicketResponse = {
      id: Date.now().toString(),
      ticketId: selectedTicket.id,
      userId: currentUser.id,
      message: newResponse,
      isAdminResponse: false,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_TICKET_RESPONSE', payload: response });
    setNewResponse('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400 bg-green-600';
      case 'in_progress': return 'text-yellow-400 bg-yellow-600';
      case 'closed': return 'text-gray-400 bg-gray-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-600';
      case 'medium': return 'text-yellow-400 border-yellow-600';
      case 'low': return 'text-green-400 border-green-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getUserById = (userId: string) => {
    return state.users.find(user => user.id === userId);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="flex justify-center mb-6">
            <MessageSquare className="h-20 w-20 text-red-500 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Sistema de Tickets
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Reporta problemas, solicita ayuda o comunícate con nuestros administradores.
          </p>
        </div>

        {!selectedTicket ? (
          <>
            {/* Create Ticket Button */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-white">Mis Tickets</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Ticket
              </button>
            </div>

            {/* Create Ticket Form */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-gray-900 rounded-xl border border-red-600 p-8 w-full max-w-2xl shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                    <h3 className="text-2xl font-bold text-white">Crear Nuevo Ticket</h3>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Título del ticket
                      </label>
                      <input
                        type="text"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Describe brevemente tu problema..."
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Descripción detallada
                      </label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                        placeholder="Explica tu problema con el mayor detalle posible..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleCreateTicket}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Crear Ticket
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets List */}
            {userTickets.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
                <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No tienes tickets creados
                </h3>
                <p className="text-gray-500">
                  Crea tu primer ticket para reportar problemas o solicitar ayuda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:border-red-600"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white truncate flex-1 mr-3">
                        {ticket.title}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En Progreso' : 'Cerrado'}
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {ticket.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <div className={`px-2 py-1 border rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                      </div>
                      <span className="text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {ticket.responses.length > 0 && (
                      <div className="mt-3 text-sm text-gray-500">
                        {ticket.responses.length} respuesta{ticket.responses.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Ticket Detail View */
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
            {/* Ticket Header */}
            <div className="p-8 border-b border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Volver a mis tickets
                </button>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status === 'open' ? 'Abierto' : selectedTicket.status === 'in_progress' ? 'En Progreso' : 'Cerrado'}
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">{selectedTicket.title}</h2>
              <p className="text-gray-300 mb-4">{selectedTicket.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Creado: {new Date(selectedTicket.createdAt).toLocaleString('es-ES')}
                </div>
                <div className={`px-2 py-1 border rounded ${getPriorityColor(selectedTicket.priority)}`}>
                  Prioridad: {selectedTicket.priority === 'high' ? 'Alta' : selectedTicket.priority === 'medium' ? 'Media' : 'Baja'}
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Conversación</h3>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedTicket.responses.map((response) => {
                  const responseUser = getUserById(response.userId);
                  return (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${response.isAdminResponse ? 'bg-red-900/20 border-l-4 border-red-500' : 'bg-gray-800'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-semibold text-white">
                            {responseUser?.username || 'Usuario Desconocido'}
                            {response.isAdminResponse && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-red-600 text-white rounded">ADMIN</span>
                            )}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(response.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-gray-300">{response.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Add Response */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-gray-800 pt-6">
                  <div className="flex gap-4">
                    <textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      rows={3}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                      placeholder="Escribe tu respuesta..."
                    />
                    <button
                      onClick={handleAddResponse}
                      disabled={!newResponse.trim()}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}