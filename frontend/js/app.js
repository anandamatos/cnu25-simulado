import { API_BASE, EIXOS_FIXOS, MATERIAS_POR_EIXO } from './utils.js';
import { renderSelectionScreen, bindSelectionEvents } from './quiz.js';

// Estado global da aplicação
export const appState = {
    currentScreen: 'selection',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    provaConfig: {},
    PROVA_CONFIG: {}
};

// Configurações da aplicação
export async function carregarConfiguracoes() {
    try {
        const response = await fetch(`${API_BASE}/questoes`);
        const questoes = await response.json();
        
        appState.PROVA_CONFIG = {
            gerais: { temas: {} },
            especificos: { eixos: {} }
        };
        
        // Popular configurações
        questoes.forEach(questao => {
            if (questao.tipo === 'gerais' && questao.tema) {
                appState.PROVA_CONFIG.gerais.temas[questao.tema] = true;
            } else if (questao.tipo === 'especificos' && questao.eixo && questao.tema) {
                if (!appState.PROVA_CONFIG.especificos.eixos[questao.eixo]) {
                    appState.PROVA_CONFIG.especificos.eixos[questao.eixo] = {};
                }
                appState.PROVA_CONFIG.especificos.eixos[questao.eixo][questao.tema] = true;
            }
        });
        
        console.log('✅ Configurações carregadas:', appState.PROVA_CONFIG);
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
    }
}

// Gerenciamento de telas
export function renderScreen() {
    const app = document.getElementById('app');
    
    switch(appState.currentScreen) {
        case 'selection':
            renderSelectionScreen();
            bindSelectionEvents();
            break;
        case 'quiz':
            renderQuizScreen();
            break;
        case 'results':
            renderResultsScreen();
            break;
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async function() {
    await carregarConfiguracoes();
    renderScreen();
});

// Exportar para uso global (para os event listeners)
window.appState = appState;
window.renderScreen = renderScreen;