import { API_BASE, EIXOS_FIXOS, MATERIAS_POR_EIXO, gerarKeyUnica } from './utils.js';

// Estado global da aplicação
const appState = {
    currentScreen: 'selection',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    provaConfig: {},
    PROVA_CONFIG: {}
};

// ========== CONFIGURAÇÕES ==========
async function carregarConfiguracoes() {
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

// ========== TELA DE SELEÇÃO ==========
function renderSelectionScreen() {
    document.getElementById('app').innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg text-center fade-in">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Simulado FGV - Prova Objetiva</h1>
            <p class="text-gray-600 mb-6">Selecione o tipo de prova e configurações</p>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Prova</label>
                <select id="tipo-prova" class="w-full border border-gray-300 rounded-lg p-3">
                    <option value="">Selecione o tipo de prova</option>
                    <option value="objetiva">Prova Objetiva Completa (90 questões)</option>
                    <option value="gerais">Conhecimentos Gerais</option>
                    <option value="especificos">Conhecimentos Específicos</option>
                </select>
            </div>

            <div id="config-gerais" class="hidden mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                        <select id="modalidade-gerais" class="w-full border border-gray-300 rounded-lg p-3">
                            <option value="completa">Prova Completa (30 questões)</option>
                            <option value="por-tema">Por Tema Específico</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                        <select id="tema-gerais" class="w-full border border-gray-300 rounded-lg p-3" disabled>
                            <option value="">Selecione um tema</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="config-especificos" class="hidden mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                        <select id="modalidade-especificos" class="w-full border border-gray-300 rounded-lg p-3">
                            <option value="completa">Prova Completa (60 questões)</option>
                            <option value="por-eixo">Por Eixo Temático</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Eixo Temático</label>
                        <select id="eixo-especificos" class="w-full border border-gray-300 rounded-lg p-3" disabled>
                            <option value="">Selecione um eixo</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Matéria</label>
                        <select id="materia-especificos" class="w-full border border-gray-300 rounded-lg p-3" disabled>
                            <option value="">Selecione uma matéria</option>
                        </select>
                    </div>
                </div>

                <div id="config-bloco-personalizado" class="hidden mt-4">
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="text-lg font-semibold text-green-800 mb-4">📚 Bloco de Questões Disponível</h3>
                        <div class="grid grid-cols-1 gap-3">
                            <div class="w-full text-left p-4 bg-white border-2 border-green-400 rounded-lg">
                                <div class="font-semibold text-green-800">Modalidades & Dispensa: 1 a 10</div>
                                <div class="text-sm text-green-600 mt-1">Questões 1 a 10 sobre modalidades e dispensa de licitação</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="config-num-questoes" class="hidden mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Número de Questões</label>
                <select id="num-questions" class="w-full border border-gray-300 rounded-lg p-3">
                    <!-- Opções serão preenchidas dinamicamente -->
                </select>
            </div>

            <div id="info-prova" class="bg-blue-50 p-4 rounded-lg mb-6 hidden">
                <h3 class="font-semibold text-blue-800 mb-2">Informações da Prova Selecionada</h3>
                <p id="info-text" class="text-blue-700"></p>
            </div>
            
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

// ========== FUNÇÕES DE CONFIGURAÇÃO ==========
function atualizarConfiguracoesProva() {
    const tipoProva = document.getElementById('tipo-prova').value;
    
    document.getElementById('config-gerais').classList.add('hidden');
    document.getElementById('config-especificos').classList.add('hidden');
    document.getElementById('config-num-questoes').classList.add('hidden');
    document.getElementById('info-prova').classList.add('hidden');

    if (tipoProva === 'objetiva') {
        document.getElementById('info-prova').classList.remove('hidden');
        document.getElementById('info-text').textContent = 
            'Prova Objetiva Completa - 90 questões (30 Conhecimentos Gerais + 60 Conhecimentos Específicos)';
        atualizarNumeroQuestoes();
        
    } else if (tipoProva === 'gerais') {
        document.getElementById('config-gerais').classList.remove('hidden');
        popularTemasGerais();
        atualizarNumeroQuestoes();
        
    } else if (tipoProva === 'especificos') {
        document.getElementById('config-especificos').classList.remove('hidden');
        popularEixosEspecificos();
        atualizarConfigEspecificos();
    }
}

function popularTemasGerais() {
    const select = document.getElementById('tema-gerais');
    select.innerHTML = '<option value="">Selecione um tema</option>';
    
    const modalidade = document.getElementById('modalidade-gerais').value;
    
    if (modalidade === 'por-tema' && appState.PROVA_CONFIG.gerais && appState.PROVA_CONFIG.gerais.temas) {
        Object.keys(appState.PROVA_CONFIG.gerais.temas).forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            select.appendChild(option);
        });
        select.disabled = false;
    } else {
        select.disabled = true;
    }
}

function popularEixosEspecificos() {
    const select = document.getElementById('eixo-especificos');
    select.innerHTML = '<option value="">Selecione um eixo</option>';
    
    EIXOS_FIXOS.forEach(eixo => {
        const option = document.createElement('option');
        option.value = eixo;
        option.textContent = eixo;
        select.appendChild(option);
    });
    
    const modalidade = document.getElementById('modalidade-especificos').value;
    select.disabled = modalidade !== 'por-eixo';
}

function atualizarConfigEspecificos() {
    const modalidade = document.getElementById('modalidade-especificos').value;
    const eixoSelect = document.getElementById('eixo-especificos');
    const materiaSelect = document.getElementById('materia-especificos');
    
    if (modalidade === 'por-eixo') {
        eixoSelect.disabled = false;
        if (eixoSelect.value) {
            atualizarMaterias();
        } else {
            materiaSelect.disabled = true;
            materiaSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
            verificarBlocoPersonalizado(); 
        }
    } else {
        eixoSelect.disabled = true;
        materiaSelect.disabled = true;
        materiaSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
        document.getElementById('config-bloco-personalizado').classList.add('hidden');
    }
    atualizarNumeroQuestoes();
}

function atualizarMaterias() {
    const eixo = document.getElementById('eixo-especificos').value;
    const materiaSelect = document.getElementById('materia-especificos');
    
    materiaSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
    materiaSelect.disabled = true;
    
    if (eixo) {
        const temas = MATERIAS_POR_EIXO[eixo] || [];
        
        if (temas && temas.length > 0) {
            materiaSelect.disabled = false;
            temas.forEach(tema => {
                const option = document.createElement('option');
                option.value = tema;
                option.textContent = tema;
                materiaSelect.appendChild(option);
            });
        }
    }
    
    verificarBlocoPersonalizado();
    atualizarNumeroQuestoes();
}

function verificarBlocoPersonalizado() {
    const eixo = document.getElementById('eixo-especificos').value;
    const materia = document.getElementById('materia-especificos').value;
    const blocoSection = document.getElementById('config-bloco-personalizado');
    
    if (eixo === 'Eixo 4 - Licitações e LRF' && materia === 'Lei 14.133/2021') {
        blocoSection.classList.remove('hidden');
    } else {
        blocoSection.classList.add('hidden');
    }
}

function atualizarNumeroQuestoes() {
    const tipoProva = document.getElementById('tipo-prova').value;
    const numQuestoesSelect = document.getElementById('num-questions');
    const configNumQuestoes = document.getElementById('config-num-questoes');
    
    numQuestoesSelect.innerHTML = '';
    configNumQuestoes.classList.remove('hidden');

    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21];
    const opcoes = fibonacci.map(n => n * 10).filter(n => n <= 200);

    if (tipoProva === 'objetiva') {
        const option = document.createElement('option');
        option.value = 90;
        option.textContent = '90 questões (Prova Completa)';
        numQuestoesSelect.appendChild(option);
        
    } else if (tipoProva === 'gerais') {
        const modalidade = document.getElementById('modalidade-gerais').value;
        
        if (modalidade === 'completa') {
            const option = document.createElement('option');
            option.value = 30;
            option.textContent = '30 questões (Prova Completa)';
            numQuestoesSelect.appendChild(option);
        } else {
            opcoes.forEach(num => {
                if (num <= 30) {
                    const option = document.createElement('option');
                    option.value = num;
                    option.textContent = `${num} questões`;
                    numQuestoesSelect.appendChild(option);
                }
            });
        }
        
    } else if (tipoProva === 'especificos') {
        const modalidade = document.getElementById('modalidade-especificos').value;
        const eixo = document.getElementById('eixo-especificos').value;
        const materia = document.getElementById('materia-especificos').value;
        
        if (modalidade === 'completa') {
            const option = document.createElement('option');
            option.value = 60;
            option.textContent = '60 questões (Prova Completa)';
            numQuestoesSelect.appendChild(option);
        } else if (modalidade === 'por-eixo') {
            if (eixo === 'Eixo 4 - Licitações e LRF' && materia === 'Lei 14.133/2021') {
                const option = document.createElement('option');
                option.value = 'modalidades-dispensa-1a10';
                option.textContent = 'Modalidades & Dispensa: 1 a 10 (10 questões)';
                numQuestoesSelect.appendChild(option);
            }
            
            opcoes.forEach(num => {
                if (num <= 60 && numQuestoesSelect.querySelector(`option[value="${num}"]`) === null) {
                    const option = document.createElement('option');
                    option.value = num;
                    option.textContent = `${num} questões`;
                    numQuestoesSelect.appendChild(option);
                }
            });
        }
    }

    atualizarInfoProva();
}

function atualizarInfoProva() {
    const tipoProva = document.getElementById('tipo-prova').value;
    const infoProva = document.getElementById('info-prova');
    const infoText = document.getElementById('info-text');
    
    let texto = '';
    
    if (tipoProva === 'objetiva') {
        texto = 'Prova Objetiva Completa - 90 questões (30 Conhecimentos Gerais + 60 Conhecimentos Específicos)';
    } else if (tipoProva === 'gerais') {
        const modalidade = document.getElementById('modalidade-gerais').value;
        const tema = document.getElementById('tema-gerais').value;
        const numQuestoes = document.getElementById('num-questions').value;
        
        if (modalidade === 'completa') {
            texto = `Conhecimentos Gerais - Prova Completa (${numQuestoes} questões)`;
        } else {
            texto = `Conhecimentos Gerais - ${tema} (${numQuestoes} questões)`;
        }
    } else if (tipoProva === 'especificos') {
        const modalidade = document.getElementById('modalidade-especificos').value;
        const eixo = document.getElementById('eixo-especificos').value;
        const materia = document.getElementById('materia-especificos').value;
        const numQuestoes = document.getElementById('num-questions').value;
        
        if (modalidade === 'completa') {
            texto = `Conhecimentos Específicos - Prova Completa (${numQuestoes} questões)`;
        } else if (modalidade === 'por-eixo') {
            if (numQuestoes === 'modalidades-dispensa-1a10') {
                texto = `Conhecimentos Específicos - ${eixo} - ${materia} - Modalidades & Dispensa: 1 a 10`;
            } else if (eixo && materia) {
                texto = `Conhecimentos Específicos - ${eixo} - ${materia} (${numQuestoes} questões)`;
            } else {
                 texto = `Conhecimentos Específicos - Selecione Eixo/Matéria`;
            }
        }
    }
    
    infoText.textContent = texto;
    infoProva.classList.remove('hidden');
}

// ========== QUIZ FUNCTIONS ==========
async function startQuiz() {
    const tipoProva = document.getElementById('tipo-prova').value;
    
    if (!tipoProva) {
        alert('Por favor, selecione o tipo de prova.');
        return;
    }

    // Salvar configurações no estado global
    appState.provaConfig = {
        tipo: tipoProva,
        modalidade: document.getElementById('modalidade-especificos')?.value || 
                   document.getElementById('modalidade-gerais')?.value || 'completa',
        eixo: document.getElementById('eixo-especificos')?.value || '',
        materia: document.getElementById('materia-especificos')?.value || '',
        tema: document.getElementById('tema-gerais')?.value || '',
        numQuestoes: document.getElementById('num-questions')?.value || ''
    };

    let url = `${API_BASE}/prova-questions?tipo=${encodeURIComponent(tipoProva)}`;
    
    if (tipoProva === 'gerais') {
        const modalidade = document.getElementById('modalidade-gerais').value;
        const tema = document.getElementById('tema-gerais').value;
        const numQuestoes = document.getElementById('num-questions').value;
        
        if (modalidade === 'por-tema' && !tema) {
            alert('Por favor, selecione um tema.');
            return;
        }
        
        url += `&categoria=${modalidade === 'completa' ? 'completa' : encodeURIComponent(tema)}`;
        url += `&numQuestions=${encodeURIComponent(numQuestoes)}`;
        
    } else if (tipoProva === 'especificos') {
        const modalidade = document.getElementById('modalidade-especificos').value;
        const eixo = document.getElementById('eixo-especificos').value;
        const materia = document.getElementById('materia-especificos').value;
        const numQuestoes = document.getElementById('num-questions').value;
        
        if (modalidade === 'por-eixo') {
            if (!eixo || !materia) {
                alert('Por favor, selecione um eixo e uma matéria.');
                return;
            }

            if (numQuestoes === 'modalidades-dispensa-1a10') {
                url = `${API_BASE}/bloco-questions/modalidades-dispensa-1a10`;
            } else {
                url += `&categoria=${encodeURIComponent(eixo)}&subcategoria=${encodeURIComponent(materia)}`;
                url += `&numQuestions=${encodeURIComponent(numQuestoes)}`;
            }
        } else {
            url += `&categoria=completa`;
            url += `&numQuestions=${encodeURIComponent(numQuestoes)}`;
        }
    }

    console.log('🔍 Buscando questões na URL:', url);

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        appState.questions = await response.json();
        
        console.log('✅ Questões carregadas:', appState.questions.length);
        
        if (appState.questions.length === 0) {
            alert('Nenhuma questão encontrada com os filtros selecionados!');
            return;
        }

        appState.currentScreen = 'quiz';
        appState.currentQuestionIndex = 0;
        appState.userAnswers = new Array(appState.questions.length).fill(null);
        appState.score = 0;
        
        renderScreen();
    } catch (error) {
        console.error('❌ Erro ao carregar questões:', error);
        alert('Erro ao carregar questões: ' + error.message);
    }
}

function renderQuizScreen() {
    const currentQuestion = appState.questions[appState.currentQuestionIndex];
    const progress = ((appState.currentQuestionIndex + 1) / appState.questions.length) * 100;
    
    document.getElementById('app').innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg">
            <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-blue-700">
                        Questão ${appState.currentQuestionIndex + 1} de ${appState.questions.length}
                    </span>
                    <span class="text-sm font-medium text-gray-600">
                        Pontuação: ${appState.score}
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
            </div>

            <h2 class="text-2xl font-semibold text-gray-800 mb-8">${currentQuestion.enunciado}</h2>
            
            <div id="options-container" class="grid grid-cols-1 gap-4 mb-8">
                ${renderOptions(currentQuestion)}
            </div>

            <div class="flex justify-between">
                <button onclick="prevQuestion()" 
                        class="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors ${appState.currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    Anterior
                </button>
                <button onclick="nextQuestion()" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                    ${appState.currentQuestionIndex === appState.questions.length - 1 ? 'Finalizar' : 'Próxima'}
                </button>
            </div>
        </div>
    `;
}

function renderOptions(question) {
    const options = question.alternativas || [];
    
    if (!Array.isArray(options) || options.length === 0) {
        return '<div class="text-red-500 p-4 bg-red-50 border border-red-300 rounded-lg">Erro: Nenhuma alternativa disponível</div>';
    }
    
    const validOptions = options.filter(opt => opt !== undefined && opt !== null && opt !== '');
    
    if (validOptions.length === 0) {
        return '<div class="text-red-500 p-4 bg-red-50 border border-red-300 rounded-lg">Erro: Alternativas inválidas</div>';
    }
    
    return validOptions.map((option, index) => {
        const optionText = option || `Alternativa ${String.fromCharCode(65 + index)}`;
        return `
            <button onclick="selectAnswer(${index})" 
                    class="quiz-option w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 ${appState.userAnswers[appState.currentQuestionIndex] === index ? 'selected' : ''}">
                <span class="font-bold mr-2">${String.fromCharCode(65 + index)}.</span> ${optionText}
            </button>
        `;
    }).join('');
}

function selectAnswer(optionIndex) {
    appState.userAnswers[appState.currentQuestionIndex] = optionIndex;
    renderScreen();
}

function prevQuestion() {
    if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex--;
        renderScreen();
    }
}

function nextQuestion() {
    const currentAnswer = appState.userAnswers[appState.currentQuestionIndex];
    const correctAnswer = appState.questions[appState.currentQuestionIndex].correct_option;
    
    if (currentAnswer === correctAnswer) {
        appState.score++;
    }

    if (appState.currentQuestionIndex < appState.questions.length - 1) {
        appState.currentQuestionIndex++;
        renderScreen();
    } else {
        finishQuiz();
    }
}

async function finishQuiz() {
    const percentage = (appState.score / appState.questions.length) * 100;
    
    appState.currentScreen = 'results';
    renderScreen();
}

function renderResultsScreen() {
    const percentage = (appState.score / appState.questions.length) * 100;
    
    // Determinar a categoria para o dashboard
    let categoriaDashboard = '';
    let subtemaDashboard = '';
    
    const tipoProva = appState.provaConfig.tipo || 'especificos';
    const modalidade = appState.provaConfig.modalidade || 'completa';
    const eixo = appState.provaConfig.eixo || '';
    const materia = appState.provaConfig.materia || '';
    const numQuestoesConfig = appState.provaConfig.numQuestoes || '';
    
    if (tipoProva === 'objetiva') {
        categoriaDashboard = 'Prova Objetiva Completa';
        subtemaDashboard = 'Simulado Completo 90 questões';
    } else if (tipoProva === 'gerais') {
        if (modalidade === 'completa') {
            categoriaDashboard = 'Conhecimentos Gerais';
            subtemaDashboard = 'Simulado Gerais Completo';
        } else {
            const tema = appState.provaConfig.tema || 'Tema Geral';
            categoriaDashboard = 'Conhecimentos Gerais';
            subtemaDashboard = `Gerais - ${tema}`;
        }
    } else if (tipoProva === 'especificos') {
        if (modalidade === 'completa') {
            categoriaDashboard = 'Conhecimentos Específicos';
            subtemaDashboard = 'Simulado Específicos Completo';
        } else {
            categoriaDashboard = eixo || 'Conhecimentos Específicos';
            
            if (numQuestoesConfig === 'modalidades-dispensa-1a10') {
                subtemaDashboard = `Modalidades & Dispensa: 1 a 10`;
            } else {
                subtemaDashboard = `${materia} - ${appState.questions.length} questões`;
            }
        }
    }
    
    document.getElementById('app').innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Resultado Final</h2>
            
            <div class="text-5xl font-bold text-blue-600 mb-4">
                ${appState.score} / ${appState.questions.length}
            </div>
            
            <div class="text-3xl font-semibold text-gray-700 mb-8">
                (${percentage.toFixed(1)}%)
            </div>

            <!-- Seção para adicionar ao Dashboard -->
            <div id="adicionar-dashboard-section" class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="text-xl font-semibold text-blue-800 mb-4">📊 Adicionar ao Dashboard de Performance</h3>
                <p class="text-blue-700 mb-4">
                    Salve este resultado para acompanhar sua evolução no painel de desempenho!
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="text-left bg-white p-4 rounded-lg border border-blue-200">
                        <p class="font-semibold text-blue-700">Categoria:</p>
                        <p class="text-gray-700 mt-1">${categoriaDashboard}</p>
                    </div>
                    <div class="text-left bg-white p-4 rounded-lg border border-blue-200">
                        <p class="font-semibold text-blue-700">Subtema:</p>
                        <p class="text-gray-700 mt-1">${subtemaDashboard}</p>
                    </div>
                    <div class="text-left bg-white p-4 rounded-lg border border-blue-200">
                        <p class="font-semibold text-blue-700">Nota:</p>
                        <p class="text-gray-700 mt-1">${percentage.toFixed(1)}%</p>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button onclick="adicionarAoDashboard('${categoriaDashboard}', '${subtemaDashboard}', ${percentage})" 
                            class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        ✅ Sim, Salvar no Dashboard
                    </button>
                    <button onclick="pularAdicionarDashboard()" 
                            class="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors">
                        ❌ Pular
                    </button>
                </div>
            </div>

            <!-- Mensagem de sucesso -->
            <div id="dashboard-success" class="hidden mb-6 p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <div class="text-2xl mb-2">✅</div>
                <p class="font-semibold text-lg">Resultado salvo com sucesso!</p>
                <p class="mt-2">Seu desempenho foi registrado no dashboard de performance.</p>
                <a href="dashboard.html" class="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                    📊 Ver Dashboard Agora
                </a>
            </div>

            <!-- Botões de ação -->
            <div class="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button onclick="showReview()" class="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors">
                    🔍 Revisar Respostas
                </button>
                <button onclick="restartQuiz()" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                    🎯 Novo Simulado
                </button>
                <a href="dashboard.html" class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2">
                    📊 Ver Dashboard
                </a>
            </div>
        </div>
    `;
}

async function adicionarAoDashboard(categoria, subtema, nota) {
    try {
        console.log('📊 Salvando resultado no dashboard:', { categoria, subtema, nota });
        
        const key = gerarKeyUnica(subtema);
        const grupo = categoria.includes('Gerais') || categoria === 'Conhecimentos Gerais' ? 'gerais' : 'especificos';
        
        const payload = {
            key: key,
            scores: [nota],
            eixo: categoria,
            tema: categoria,
            subtema: subtema,
            grupo: grupo
        };
        
        const response = await fetch('http://localhost:3000/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            document.getElementById('adicionar-dashboard-section').classList.add('hidden');
            document.getElementById('dashboard-success').classList.remove('hidden');
            console.log('✅ Resultado salvo no dashboard com sucesso!');
        } else {
            throw new Error('Erro ao salvar no servidor');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar no dashboard:', error);
        alert('Erro ao salvar resultado. Tente novamente.');
    }
}

function pularAdicionarDashboard() {
    document.getElementById('adicionar-dashboard-section').classList.add('hidden');
}

function showReview() {
    alert('Funcionalidade de revisão em desenvolvimento!');
}

function restartQuiz() {
    appState.currentScreen = 'selection';
    appState.questions = [];
    appState.currentQuestionIndex = 0;
    appState.userAnswers = [];
    appState.score = 0;
    appState.provaConfig = {};
    renderScreen();
}

// ========== EVENT LISTENERS ==========
function bindSelectionEvents() {
    document.getElementById('tipo-prova').addEventListener('change', atualizarConfiguracoesProva);
    document.getElementById('modalidade-gerais').addEventListener('change', function() {
        popularTemasGerais();
        atualizarNumeroQuestoes();
    });
    document.getElementById('tema-gerais').addEventListener('change', atualizarNumeroQuestoes);
    document.getElementById('modalidade-especificos').addEventListener('change', function() {
        popularEixosEspecificos();
        atualizarConfigEspecificos();
    });
    document.getElementById('eixo-especificos').addEventListener('change', function() {
        atualizarMaterias();
    });
    document.getElementById('materia-especificos').addEventListener('change', function() {
        verificarBlocoPersonalizado();
        atualizarNumeroQuestoes();
    });
    document.getElementById('num-questions').addEventListener('change', atualizarInfoProva);
    document.getElementById('btn-iniciar-simulado').addEventListener('click', startQuiz);
}

// ========== RENDER SCREEN ==========
function renderScreen() {
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

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async function() {
    await carregarConfiguracoes();
    renderScreen();
});

// ========== EXPORT FUNCTIONS TO GLOBAL SCOPE ==========
window.appState = appState;
window.renderScreen = renderScreen;
window.startQuiz = startQuiz;
window.selectAnswer = selectAnswer;
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.finishQuiz = finishQuiz;
window.adicionarAoDashboard = adicionarAoDashboard;
window.pularAdicionarDashboard = pularAdicionarDashboard;
window.showReview = showReview;
window.restartQuiz = restartQuiz;