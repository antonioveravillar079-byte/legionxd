import React, { useState } from 'react';
import { Settings, Users, Trophy, FileText, Plus, Edit2, Trash2, Save, X, GripVertical, Ban, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../contexts/AppContext';
import { Question, Raffle, ClanApplication as ClanApplicationType } from '../types'; // Ensure ClanApplicationType is imported

export function AdminPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'questions' | 'raffles' | 'applications' | 'users'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showRaffleForm, setShowRaffleForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'radio' as 'radio' | 'checkbox',
    options: [''],
    required: true,
    contradictsWith: [] as string[]
  });

  const [raffleForm, setRaffleForm] = useState({
    title: '',
    description: '',
    endDate: '',
    endTime: ''
  });

  const currentUser = state.auth.currentUser;

  // Access Denied if not admin
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-red-600 p-8 text-center shadow-2xl animate-fade-in">
          <Settings className="h-20 w-20 text-red-500 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-300 text-lg">
            No tienes permisos de administrador para acceder a este panel.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'questions' as const, label: 'Preguntas', icon: FileText },
    { id: 'raffles' as const, label: 'Sorteos', icon: Trophy },
    { id: 'applications' as const, label: 'Solicitudes', icon: Users },
    { id: 'users' as const, label: 'Usuarios', icon: Settings },
  ];

  // Question management functions
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionForm.text,
      type: questionForm.type,
      options: questionForm.options.filter(opt => opt.trim() !== ''),
      required: questionForm.required,
      contradictsWith: questionForm.contradictsWith,
      order: state.questions.length + 1
    };

    dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
    resetQuestionForm();
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestion: Question = {
      ...editingQuestion,
      text: questionForm.text,
      type: questionForm.type,
      options: questionForm.options.filter(opt => opt.trim() !== ''),
      required: questionForm.required,
      contradictsWith: questionForm.contradictsWith
    };

    dispatch({ type: 'UPDATE_QUESTION', payload: updatedQuestion });
    resetQuestionForm();
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta? Esto afectará las solicitudes existentes.')) {
      dispatch({ type: 'DELETE_QUESTION', payload: questionId });
    }
  };

  const handleQuestionDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(state.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    dispatch({ type: 'REORDER_QUESTIONS', payload: updatedItems });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      type: 'radio',
      options: [''],
      required: true,
      contradictsWith: []
    });
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const startEditingQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      type: question.type,
      options: question.options || [''],
      required: question.required,
      contradictsWith: question.contradictsWith || []
    });
    setShowQuestionForm(true);
  };

  // Raffle management functions
  const handleAddRaffle = () => {
    const endDateTime = new Date(`${raffleForm.endDate}T${raffleForm.endTime}`);
    
    const newRaffle: Raffle = {
      id: Date.now().toString(),
      title: raffleForm.title,
      description: raffleForm.description,
      endDate: endDateTime,
      participants: [],
      isActive: true,
      winner: null, // Ensure winner is null initially
      createdBy: currentUser.id
    };

    dispatch({ type: 'ADD_RAFFLE', payload: newRaffle });
    resetRaffleForm();
  };

  const handleUpdateRaffle = () => {
    if (!editingRaffle) return;

    const endDateTime = new Date(`${raffleForm.endDate}T${raffleForm.endTime}`);
    
    const updatedRaffle: Raffle = {
      ...editingRaffle,
      title: raffleForm.title,
      description: raffleForm.description,
      endDate: endDateTime
    };

    dispatch({ type: 'UPDATE_RAFFLE', payload: updatedRaffle });
    resetRaffleForm();
  };

  const handleDeleteRaffle = (raffleId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este sorteo?')) {
      dispatch({ type: 'DELETE_RAFFLE', payload: raffleId });
    }
  };

  const handleDrawWinner = (raffleId: string) => {
    const raffle = state.raffles.find(r => r.id === raffleId);
    if (!raffle || raffle.participants.length === 0) {
      alert("No hay participantes para sortear un ganador.");
      return;
    }
    if (!confirm('¿Estás seguro de que quieres sortear un ganador para este sorteo? Esta acción es irreversible.')) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * raffle.participants.length);
    const winnerId = raffle.participants[randomIndex];

    dispatch({ 
      type: 'SET_RAFFLE_WINNER', 
      payload: { raffleId, winnerId } 
    });
  };

  const resetRaffleForm = () => {
    setRaffleForm({
      title: '',
      description: '',
      endDate: '',
      endTime: ''
    });
    setShowRaffleForm(false);
    setEditingRaffle(null);
  };

  const startEditingRaffle = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    const endDate = new Date(raffle.endDate);
    setRaffleForm({
      title: raffle.title,
      description: raffle.description,
      endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD
      endTime: endDate.toTimeString().slice(0, 5) // HH:MM
    });
    setShowRaffleForm(true);
  };

  const getUserById = (userId: string) => {
    return state.users.find(user => user.id === userId);
  };

  const handleDeleteUser = (userId: string) => {
    const user = getUserById(userId);
    if (confirm(`¿Estás seguro de que quieres eliminar permanentemente al usuario "${user?.username}"? Esta acción es irreversible.`)) {
      dispatch({ type: 'DELETE_USER', payload: userId });
    }
  };

  const handleBanUser = (userId: string) => {
    const user = getUserById(userId);
    if (confirm(`¿Estás seguro de que quieres banear al usuario "${user?.username}"?`)) {
      dispatch({ type: 'BAN_USER', payload: userId });
    }
  };

  const handleUnbanUser = (userId: string) => {
    if (confirm(`¿Estás seguro de que quieres desbanear al usuario "${getUserById(userId)?.username}"?`)) {
        dispatch({ type: 'UNBAN_USER', payload: userId });
    }
  };

  const handleApplicationStatus = (appId: string, status: 'approved' | 'rejected') => {
    const application = state.applications.find(app => app.id === appId);
    if (!application) return;

    if (confirm(`¿Estás seguro de que quieres ${status === 'approved' ? 'aprobar' : 'rechazar'} la solicitud de ${getUserById(application.userId)?.username}?`)) {
        dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { appId, status } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="flex justify-center mb-6">
            <Settings className="h-20 w-20 text-red-500 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Panel de Administración
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Control total sobre las preguntas de solicitud, sorteos, miembros y aplicaciones del clan.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-xl p-2 flex space-x-2 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 group ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Tab Content */}
        {activeTab === 'questions' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Gestionar Preguntas de Solicitud</h2>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Pregunta
              </button>
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-gray-900 rounded-xl border border-red-600 p-8 w-full max-w-2xl shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                    <h3 className="text-2xl font-bold text-white">
                      {editingQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
                    </h3>
                    <button
                      onClick={resetQuestionForm}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Texto de la pregunta
                      </label>
                      <input
                        type="text"
                        value={questionForm.text}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Escribe tu pregunta aquí..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">
                          Tipo de respuesta
                        </label>
                        <select
                          value={questionForm.type}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value as 'radio' | 'checkbox' }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="radio">Opción única (Radio)</option>
                          <option value="checkbox">Múltiple selección (Checkbox)</option>
                        </select>
                      </div>

                      <div className="flex items-end pb-1">
                        <label className="flex items-center text-base font-medium text-gray-300">
                          <input
                            type="checkbox"
                            checked={questionForm.required}
                            onChange={(e) => setQuestionForm(prev => ({ ...prev, required: e.target.checked }))}
                            className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                          />
                          <span className="ml-3">Pregunta requerida</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Opciones de respuesta
                      </label>
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3 mb-3">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...questionForm.options];
                              newOptions[index] = e.target.value;
                              setQuestionForm(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={`Opción ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = questionForm.options.filter((_, i) => i !== index);
                              setQuestionForm(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Eliminar opción"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }))}
                        className="mt-3 px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-base font-medium"
                      >
                        <Plus className="h-5 w-5 mr-2 inline" /> Agregar Opción
                      </button>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Respuestas que contradicen (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={questionForm.contradictsWith.join(', ')}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, contradictsWith: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej: Menos de 18, Tramposo, Toxico"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Si un usuario selecciona estas opciones, su solicitud será marcada como contradictoria.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {editingQuestion ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
                      </button>
                      <button
                        onClick={resetQuestionForm}
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

            {/* Questions List */}
            {state.questions.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No hay preguntas de solicitud
                </h3>
                <p className="text-gray-500">
                  Agrega preguntas para que los usuarios puedan aplicar al clan.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleQuestionDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-5">
                      {state.questions.sort((a, b) => a.order - b.order).map((question, index) => (
                        <Draggable key={question.id} draggableId={question.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-md flex items-center justify-between transition-all duration-200 transform hover:scale-[1.005]"
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-2 cursor-grab text-gray-500 hover:text-red-500 transition-colors bg-gray-800 rounded-md"
                                  title="Arrastrar para reordenar"
                                >
                                  <GripVertical className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-white mb-1">
                                    {index + 1}. {question.text}
                                    {question.required && (
                                      <span className="text-red-500 ml-2 text-sm">(Requerida)</span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    Tipo: <span className="font-medium">{question.type === 'radio' ? 'Opción única' : 'Múltiple selección'}</span>
                                  </p>
                                  {question.options && question.options.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {question.options.map((option, optionIndex) => (
                                        <span
                                          key={optionIndex}
                                          className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                                        >
                                          {option}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {question.contradictsWith && question.contradictsWith.length > 0 && (
                                    <p className="text-xs text-red-400 mt-2">
                                      Contradictorias: {question.contradictsWith.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditingQuestion(question)}
                                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                  title="Editar pregunta"
                                >
                                  <Edit2 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="p-3 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-full transition-colors"
                                  title="Eliminar pregunta"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}

        {/* Raffles Tab Content */}
        {activeTab === 'raffles' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Gestionar Sorteos</h2>
              <button
                onClick={() => setShowRaffleForm(true)}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Sorteo
              </button>
            </div>

            {/* Raffle Form Modal */}
            {showRaffleForm && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-gray-900 rounded-xl border border-red-600 p-8 w-full max-w-2xl shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                    <h3 className="text-2xl font-bold text-white">
                      {editingRaffle ? 'Editar Sorteo' : 'Nuevo Sorteo'}
                    </h3>
                    <button
                      onClick={resetRaffleForm}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Título del sorteo
                      </label>
                      <input
                        type="text"
                        value={raffleForm.title}
                        onChange={(e) => setRaffleForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej: Sorteo de 1000 Robux"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={raffleForm.description}
                        onChange={(e) => setRaffleForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                        placeholder="Detalles del premio, requisitos, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">
                          Fecha de cierre
                        </label>
                        <input
                          type="date"
                          value={raffleForm.endDate}
                          onChange={(e) => setRaffleForm(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">
                          Hora de cierre
                        </label>
                        <input
                          type="time"
                          value={raffleForm.endTime}
                          onChange={(e) => setRaffleForm(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={editingRaffle ? handleUpdateRaffle : handleAddRaffle}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {editingRaffle ? 'Actualizar Sorteo' : 'Crear Sorteo'}
                      </button>
                      <button
                        onClick={resetRaffleForm}
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

            {/* Raffles List */}
            {state.raffles.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No hay sorteos creados
                </h3>
                <p className="text-gray-500">
                  Crea sorteos para ofrecer premios exclusivos a los miembros del clan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.raffles.map((raffle) => {
                  const winner = raffle.winner ? getUserById(raffle.winner) : null;
                  const raffleStatus = new Date(raffle.endDate) > new Date() ? 'active' : (raffle.winner ? 'completed' : 'no_winner');

                  const statusClasses = {
                    active: 'border-red-600',
                    completed: 'border-green-600 opacity-90',
                    no_winner: 'border-gray-600 opacity-70'
                  };

                  const statusTextClasses = {
                    active: 'text-red-400',
                    completed: 'text-green-400',
                    no_winner: 'text-gray-400'
                  };

                  return (
                    <div
                      key={raffle.id}
                      className={`bg-gray-900 rounded-xl border ${statusClasses[raffleStatus]} overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] ${raffleStatus === 'active' ? 'hover:shadow-red-700/50' : ''}`}
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
                            <span className="font-semibold">Cierre: </span>
                            <span className="ml-2 text-white">{new Date(raffle.endDate).toLocaleString('es-ES')}</span>
                          </div>
                          
                          <div className="flex items-center text-lg text-gray-400">
                            <Users className="h-5 w-5 text-red-400 mr-3" />
                            <span className="font-semibold">Participantes: </span>
                            <span className="ml-2 text-white">{raffle.participants.length}</span>
                          </div>
                        </div>

                        {raffleStatus === 'active' ? (
                          <button
                            onClick={() => handleDrawWinner(raffle.id)}
                            disabled={raffle.participants.length === 0}
                            className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 shadow-lg flex items-center justify-center group ${
                              raffle.participants.length > 0
                                ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Trophy className="h-5 w-5 mr-2" /> Sortear Ganador
                          </button>
                        ) : winner ? (
                          <div className="bg-yellow-800/20 border border-yellow-700 rounded-lg p-4 flex items-center shadow-inner">
                            <Award className="h-6 w-6 text-yellow-500 mr-3" />
                            <div>
                              <span className="font-bold text-yellow-400 text-lg">Ganador: </span>
                              <span className="text-white text-lg">{winner.username}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                            <span className="text-gray-400 font-medium">Sorteo finalizado sin ganador</span>
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-2 mt-6">
                          <button
                            onClick={() => startEditingRaffle(raffle)}
                            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            title="Editar sorteo"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRaffle(raffle.id)}
                            className="p-3 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-full transition-colors"
                            title="Eliminar sorteo"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab Content */}
        {activeTab === 'applications' && (
          <div className="space-y-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Gestionar Solicitudes de Ingreso</h2>

            {state.applications.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No hay solicitudes de ingreso pendientes
                </h3>
                <p className="text-gray-500">
                  Las solicitudes enviadas por los usuarios aparecerán aquí para tu revisión.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {state.applications.map((application) => {
                  const applicant = getUserById(application.userId);
                  const statusColor = {
                    pending: 'border-yellow-600',
                    approved: 'border-green-600',
                    rejected: 'border-red-600'
                  };
                  const statusIcon = {
                    pending: Clock,
                    approved: CheckCircle,
                    rejected: XCircle
                  };
                  const StatusIconComponent = statusIcon[application.status];

                  return (
                    <div
                      key={application.id}
                      className={`bg-gray-900 rounded-xl border ${statusColor[application.status]} p-8 shadow-lg transition-all duration-300 transform hover:scale-[1.005]`}
                    >
                      <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-800">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {applicant?.username || 'Usuario Desconocido'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Enviada: {new Date(application.submittedAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${application.status === 'pending' ? 'bg-yellow-600' : application.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}`}>
                            <StatusIconComponent className="h-6 w-6 text-white" />
                          </div>
                          <span className={`text-lg font-semibold ${application.status === 'pending' ? 'text-yellow-400' : application.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                            {application.status === 'pending' ? 'Pendiente' : application.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-white mb-4">Respuestas:</h4>
                      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                        {application.responses.map((response) => {
                          const question = state.questions.find(q => q.id === response.questionId);
                          return (
                            <div key={response.questionId} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <p className="text-gray-300 text-sm mb-1 font-medium">{question?.text || 'Pregunta eliminada'}</p>
                              <p className="text-white text-base">
                                {Array.isArray(response.answer) ? response.answer.join(', ') : response.answer}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-4">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'approved')}
                              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" /> Aprobar
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'rejected')}
                              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors transform hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <XCircle className="h-5 w-5 mr-2" /> Rechazar
                            </button>
                          </>
                        )}
                        {application.status !== 'pending' && (
                           <span className="flex-1 text-center py-3 px-6 bg-gray-800 rounded-full text-gray-400 font-semibold">
                             Revisado
                           </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Gestionar Usuarios del Clan</h2>

            {state.users.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  No hay usuarios registrados
                </h3>
                <p className="text-gray-500">
                  Los usuarios que se registren en la plataforma aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-lg transform transition-all duration-300 hover:scale-[1.005] hover:border-red-600"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {user.username}
                          </h3>
                          {user.isAdmin && (
                            <span className="px-3 py-1 text-xs font-bold bg-red-700 text-white rounded-full shadow-md">
                              ADMIN
                            </span>
                          )}
                          {user.banned && (
                            <span className="px-3 py-1 text-xs font-bold bg-gray-700 text-red-300 rounded-full shadow-md">
                              BANEADO
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                          Email: <span className="text-white">{user.email}</span>
                        </p>
                        <p className="text-gray-400 text-sm mb-1">
                          Registrado: <span className="text-white">{new Date(user.registeredAt).toLocaleDateString('es-ES')}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          Aplicó al clan: <span className="font-semibold text-white">{user.hasApplied ? 'Sí' : 'No'}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          Último Login: <span className="font-semibold text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Nunca'}</span>
                        </p>
                      </div>
                      
                      {/* Action buttons for users */}
                      {user.id !== currentUser?.id && ( // Prevent admin from banning/deleting themselves
                        <div className="flex flex-col space-y-2">
                          {user.banned ? (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                              title="Desbanear usuario"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
                              title="Banear usuario"
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
