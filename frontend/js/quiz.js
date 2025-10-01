import { appState, renderScreen } from './app.js';
import { API_BASE, EIXOS_FIXOS, MATERIAS_POR_EIXO } from './utils.js';
import { salvarResultadoDashboard } from './dashboard.js';

// Templates
export function renderSelectionScreen() {
    document.getElementById('app').innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg text-center fade-in">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Simulado FGV - Prova Objetiva</h1>
            <p class="text-gray-600 mb-6">Selecione o tipo de prova e configurações</p>
            
            <!-- Formulário de seleção (mesmo conteúdo, mas mais organizado) -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Prova</label>
                <select id="tipo-prova" class="w-full border border-gray-300 rounded-lg p-3">
                    <option value="">Selecione o tipo de prova</option>
                    <option value="objetiva">Prova Objetiva Completa (90 questões)</option>
                    <option value="gerais">Conhecimentos Gerais</option>
                    <option value="especificos">Conhecimentos Específicos</option>
                </select>
            </div>

            <!-- ... resto do formulário (mantido do código original, mas organizado) -->
            
            <div class="flex justify-center gap-4">
                <button id="btn-iniciar-simulado" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg">
                    Iniciar Simulado
                </button>
                <a href="dashboard.html" class="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-all duration-300 text-lg">
                    Ver Dashboard
                </a>
            </div>
        </div>
    `;
}

// ... (as outras funções do quiz seriam movidas para aqui)
// startQuiz, renderQuizScreen, nextQuestion, finishQuiz, etc.

// Exportar funções principais
export { bindSelectionEvents, startQuiz, nextQuestion, finishQuiz };