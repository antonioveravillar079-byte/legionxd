import React, { useState } from 'react';
import { User, CheckCircle, XCircle, Clock, Shield, Calendar, Mail, Edit2, Save, X, Globe, AlertTriangle, MessageSquare } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Profile() {
  const { state, dispatch } = useApp();
  const currentUser = state.auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    discordUsername: currentUser?.discordUsername || '',
    robloxUsername: currentUser?.robloxUsername || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // If user is not authenticated, display an access denied message
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-red-600 p-8 text-center shadow-2xl animate-fade-in">
          <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-red-400 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-300 text-lg">
            Debes iniciar sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  // Find the user's application details
  const userApplication = state.applications.find(app => app.userId === currentUser.id);
  
  // Helper function to get status information
  const getStatusInfo = () => {
    if (!userApplication) {
      return {
        status: 'no-applied',
        text: 'No has enviado solicitud',
        color: 'text-gray-400',
        bgColor: 'bg-gray-700',
        icon: Clock
      };
    }

    switch (userApplication.status) {
      case 'pending':
        return {
          status: 'pending',
          text: 'Solicitud en revisión',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-600',
          icon: Clock
        };
      case 'approved':
        return {
          status: 'approved',
          text: '¡Solicitud aprobada!',
          color: 'text-green-400',
          bgColor: 'bg-green-600',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          status: 'rejected',
          text: 'Solicitud rechazada',
          color: 'text-red-400',
          bgColor: 'bg-red-600',
          icon: XCircle
        };
      default:
        return {
          status: 'unknown',
          text: 'Estado desconocido',
          color: 'text-gray-400',
          bgColor: 'bg-gray-700',
          icon: Clock
        };
    }
  };

  // Validate the edit form fields
  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editForm.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (editForm.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!editForm.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!editForm.discordUsername.trim()) {
      newErrors.discordUsername = 'El nombre de Discord es requerido';
    }

    if (!editForm.robloxUsername.trim()) {
      newErrors.robloxUsername = 'El nombre de usuario de Roblox es requerido';
    }

    // Check if username or email already exist (excluding the current user)
    const existingUsername = state.users.find(u => u.username === editForm.username && u.id !== currentUser.id);
    const existingEmail = state.users.find(u => u.email === editForm.email && u.id !== currentUser.id);

    if (existingUsername) {
      newErrors.username = 'Ya existe un usuario con este nombre';
    }

    if (existingEmail) {
      newErrors.email = 'Ya existe un usuario con este email';
    }

    // Password change validation
    if (editForm.newPassword) {
      if (!editForm.currentPassword) {
        newErrors.currentPassword = 'Debes ingresar tu contraseña actual';
      } else if (editForm.currentPassword !== currentUser.password) { // In a real app, you'd verify against a hashed password
        newErrors.currentPassword = 'La contraseña actual es incorrecta';
      }

      if (editForm.newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }

      if (editForm.newPassword !== editForm.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle saving changes to user profile
  const handleSaveChanges = () => {
    if (!validateEditForm()) return;

    const updatedUser = {
      ...currentUser,
      username: editForm.username,
      email: editForm.email,
      discordUsername: editForm.discordUsername,
      robloxUsername: editForm.robloxUsername,
      password: editForm.newPassword || currentUser.password // Update password only if newPassword is provided
    };

    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    setIsEditing(false);
    // Reset form and errors after saving
    setEditForm({
      username: updatedUser.username,
      email: updatedUser.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current user values and clear errors
    setEditForm({
      username: currentUser.username,
      email: currentUser.email,
      discordUsername: currentUser.discordUsername || '',
      robloxUsername: currentUser.robloxUsername || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="flex justify-center mb-6">
            <User className="h-20 w-20 text-red-500 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3">
            Mi Perfil
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Gestiona la información de tu cuenta y consulta tu estado en el clan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Personal Information Section */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-xl transform transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <User className="h-7 w-7 text-red-500 mr-3" />
                Información Personal
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-3 bg-gray-800 text-gray-400 hover:text-white hover:bg-red-700 rounded-full transition-all duration-300 shadow-md"
                  title="Editar Perfil"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="discordUsername" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de Discord
                  </label>
                  <input
                    id="discordUsername"
                    type="text"
                    value={editForm.discordUsername}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discordUsername: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    placeholder="usuario#1234"
                  />
                  {errors.discordUsername && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.discordUsername}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="robloxUsername" className="block text-sm font-medium text-gray-300 mb-2">
                    Usuario de Roblox
                  </label>
                  <input
                    id="robloxUsername"
                    type="text"
                    value={editForm.robloxUsername}
                    onChange={(e) => setEditForm(prev => ({ ...prev, robloxUsername: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    placeholder="TuUsuarioRoblox"
                  />
                  {errors.robloxUsername && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.robloxUsername}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-6 mt-6">
                  <h4 className="text-lg font-medium text-gray-300 mb-4">Cambiar Contraseña (Opcional)</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="password"
                        placeholder="Contraseña actual"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      />
                      {errors.currentPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      />
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-gray-400 flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 text-gray-500" /> Nombre de usuario:
                  </span>
                  <div className="flex items-center">
                    <span className="text-white text-lg font-semibold">{currentUser.username}</span>
                    {currentUser.isAdmin && (
                      <span className="ml-3 px-3 py-1 text-xs font-bold bg-red-700 text-white rounded-full shadow-md">
                        ADMIN
                      </span>
                    )}
                    {currentUser.banned && (
                      <span className="ml-3 px-3 py-1 text-xs font-bold bg-gray-700 text-red-300 rounded-full shadow-md">
                        BANEADO
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-gray-400 flex items-center text-lg">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" /> Email:
                  </span>
                  <span className="text-white text-lg">{currentUser.email}</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-gray-400 flex items-center text-lg">
                    <MessageSquare className="h-5 w-5 mr-2 text-gray-500" /> Discord:
                  </span>
                  <span className="text-white text-lg">{currentUser.discordUsername || 'No especificado'}</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-gray-400 flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 text-gray-500" /> Roblox:
                  </span>
                  <span className="text-white text-lg">{currentUser.robloxUsername || 'No especificado'}</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-gray-400 flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" /> Miembro desde:
                  </span>
                  <span className="text-white text-lg">
                    {new Date(currentUser.registeredAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {currentUser.ipAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center text-lg">
                      <Globe className="h-5 w-5 mr-2 text-gray-500" /> Dirección IP:
                    </span>
                    <span className="text-white font-mono text-base">{currentUser.ipAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clan Status Section */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-xl flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-[1.01]">
            <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-gray-800 w-full flex items-center justify-center">
              <Shield className="h-7 w-7 text-red-500 mr-3" />
              Estado en el Clan
            </h2>
            
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${statusInfo.bgColor} mb-6 shadow-lg animate-bounce-in`}>
              <StatusIcon className="h-12 w-12 text-white" />
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 ${statusInfo.color}`}>
              {statusInfo.text}
            </h3>
            
            {userApplication && (
              <p className="text-gray-400 text-sm mb-6">
                Solicitud enviada el {new Date(userApplication.submittedAt).toLocaleDateString('es-ES')}
              </p>
            )}
            
            <div className="bg-gray-800 rounded-lg p-5 w-full">
              {statusInfo.status === 'no-applied' && (
                <p className="text-gray-300 text-base leading-relaxed">
                  Aún no has enviado tu solicitud de ingreso al clan. Ve a la sección "Solicitar Ingreso" para comenzar el proceso y unirte a la legión.
                </p>
              )}
              {statusInfo.status === 'pending' && (
                <p className="text-gray-300 text-base leading-relaxed">
                  Tu solicitud está siendo revisada por nuestros administradores. Te notificaremos cuando tengamos una respuesta. ¡Agradecemos tu paciencia!
                </p>
              )}
              {statusInfo.status === 'approved' && (
                <p className="text-gray-300 text-base leading-relaxed">
                  ¡Felicidades! Has sido aceptado en Nova Dark Legion. ¡Bienvenido a la legión, guerrero! Prepárate para la acción.
                </p>
              )}
              {statusInfo.status === 'rejected' && (
                <p className="text-gray-300 text-base leading-relaxed">
                  Tu solicitud no fue aprobada en esta ocasión. No te desanimes, puedes intentar aplicar nuevamente en el futuro. ¡Sigue practicando!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Application Responses Section */}
        {userApplication && (
          <div className="mt-10 bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-xl transform transition-transform duration-300 hover:scale-[1.01]">
            <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-gray-800 flex items-center">
              <Mail className="h-7 w-7 text-red-500 mr-3" />
              Respuestas de tu Solicitud
            </h2>
            
            <div className="space-y-6">
              {userApplication.responses.map((response, index) => {
                // Find the corresponding question text
                const question = state.questions.find(q => q.id === response.questionId);
                return (
                  <div key={response.questionId} className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700">
                    <h4 className="font-semibold text-white mb-2 text-lg">
                      {index + 1}. {question?.text || 'Pregunta eliminada'}
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {/* Handle array responses for checkboxes/multi-select */}
                      {Array.isArray(response.answer) 
                        ? response.answer.join(', ') 
                        : response.answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
