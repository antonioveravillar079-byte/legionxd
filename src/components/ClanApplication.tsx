import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Note: DragDropContext is imported but not used in this version.
import { GripVertical, CheckCircle, AlertTriangle, Send } from 'lucide-react'; // Added Send icon for submit button
import { useApp } from '../contexts/AppContext';
import { FormResponse, ClanApplication as ClanApplicationType } from '../types';

export function ClanApplication() {
  const { state, dispatch } = useApp();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasContradictions, setHasContradictions] = useState(false);

  const currentUser = state.auth.currentUser;
  const hasApplied = currentUser?.hasApplied || false;

  // Check for contradictions whenever responses change
  useEffect(() => {
    checkContradictions();
  }, [responses, state.questions]); // Added state.questions to dependencies as contradiction rules might depend on it

  const checkContradictions = () => {
    let foundContradiction = false;
    const newErrors: Record<string, string> = {};

    state.questions.forEach(question => {
      // Clear previous error for this question first
      if (newErrors[question.id] === 'Esta respuesta está en conflicto con los requisitos del clan') {
        delete newErrors[question.id];
      }

      if (question.contradictsWith) {
        const response = responses.find(r => r.questionId === question.id);
        if (response) {
          // Ensure response.answer is treated as an array for consistent checking
          const currentAnswers = Array.isArray(response.answer) ? response.answer : [response.answer];
          
          if (currentAnswers.some(answer => question.contradictsWith.includes(answer as string))) {
            foundContradiction = true;
            newErrors[question.id] = 'Esta respuesta está en conflicto con los requisitos del clan';
          }
        }
      }
    });

    setHasContradictions(foundContradiction);
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors })); // Merge new contradiction errors
  };

  // Handle changes in form responses
  const handleResponseChange = (questionId: string, answer: string | string[]) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, answer } : r);
      } else {
        return [...prev, { questionId, answer }];
      }
    });
    // Clear error for this question immediately on change
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[questionId];
      return updatedErrors;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Re-check contradictions and required fields before final submission
    checkContradictions(); // This will update hasContradictions and errors state
    
    // Validate required questions
    const requiredQuestions = state.questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => 
      !responses.some(r => r.questionId === q.id && (Array.isArray(r.answer) ? r.answer.length > 0 : String(r.answer).trim() !== ''))
    );

    let currentErrors: Record<string, string> = {};
    if (missingResponses.length > 0) {
      missingResponses.forEach(q => {
        currentErrors[q.id] = 'Esta pregunta es requerida';
      });
    }
    
    // Merge new required field errors with any existing contradiction errors
    setErrors(prevErrors => ({ ...prevErrors, ...currentErrors }));

    // If there are any errors or contradictions, prevent submission
    if (Object.keys(currentErrors).length > 0 || hasContradictions) {
      return;
    }

    const application: ClanApplicationType = {
      id: Date.now().toString(), // Simple ID generation
      userId: currentUser!.id,
      responses,
      submittedAt: new Date(),
      status: 'pending' // Initial status for a new application
    };

    dispatch({ type: 'SUBMIT_APPLICATION', payload: application });
  };

  // Display message if user has already applied
  if (hasApplied) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-2xl p-8 text-center border border-green-600 animate-fade-in-up">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-white mb-4">
            ¡Solicitud Enviada!
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Tu solicitud de ingreso al clan ha sido enviada correctamente. 
            Te notificaremos cuando sea revisada por nuestros administradores. ¡Gracias por tu interés!
          </p>
        </div>
      </div>
    );
  }

  // Sort questions by their order property
  const sortedQuestions = [...state.questions].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Solicitud de Ingreso
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Demuestra tu valía respondiendo estas preguntas y únete a la imparable Nova Dark Legion.
          </p>
        </div>

        {/* Contradictions Alert */}
        {hasContradictions && (
          <div className="mb-10 bg-red-900/30 border border-red-700 rounded-lg p-6 shadow-md animate-fade-in-down">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Advertencia de Contradicción</h3>
                <p className="text-red-300 leading-relaxed">
                  Hay respuestas en tu formulario que están en conflicto con los requisitos de nuestro clan. Por favor, revisa tus selecciones y corrígelas antes de enviar.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {sortedQuestions.map((question, index) => (
            <div
              key={question.id}
              className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg transition-all duration-300 transform hover:scale-[1.01] hover:border-red-600"
            >
              <h3 className="text-2xl font-semibold text-white mb-6 leading-relaxed">
                <span className="text-red-500 mr-2">{index + 1}.</span> {question.text}
                {question.required && (
                  <span className="text-red-500 ml-2 text-sm font-bold">(Requerido)</span>
                )}
              </h3>

              {/* Radio Button Options */}
              {question.type === 'radio' && question.options && (
                <div className="space-y-4">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={responses.find(r => r.questionId === question.id)?.answer === option}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500 transition-colors"
                      />
                      <span className="ml-4 text-gray-300 text-lg">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox Options */}
              {question.type === 'checkbox' && question.options && (
                <div className="space-y-4">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={(responses.find(r => r.questionId === question.id)?.answer as string[] || []).includes(option)}
                        onChange={(e) => {
                          const currentAnswers = responses.find(r => r.questionId === question.id)?.answer as string[] || [];
                          if (e.target.checked) {
                            handleResponseChange(question.id, [...currentAnswers, option]);
                          } else {
                            handleResponseChange(question.id, currentAnswers.filter(a => a !== option));
                          }
                        }}
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 transition-colors"
                      />
                      <span className="ml-4 text-gray-300 text-lg">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Error Message for the current question */}
              {errors[question.id] && (
                <p className="mt-4 text-base text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {errors[question.id]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={hasContradictions || Object.keys(errors).length > 0} // Disable if any errors or contradictions exist
              className={`inline-flex items-center px-10 py-5 text-xl font-bold rounded-full transition-all duration-300 shadow-xl group ${
                hasContradictions || Object.keys(errors).length > 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
              }`}
            >
              <Send className="h-6 w-6 mr-3 transition-transform group-hover:translate-x-1" />
              {hasContradictions || Object.keys(errors).length > 0 ? 'Corrige antes de enviar' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
