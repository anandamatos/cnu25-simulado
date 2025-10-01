// Função para mostrar tela de revisão
function showReview() {
    appState.currentScreen = 'review';
    renderScreen();
}

// Componente de Revisão
const ReviewScreen = `
    <div class="bg-white p-8 rounded-xl shadow-lg">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800">Revisão do Simulado</h2>
            <button onclick="restartQuiz()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Voltar ao Início
            </button>
        </div>
        
        <div id="review-questions" class="space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- Questões serão inseridas aqui -->
        </div>
    </div>
`;

// Função para renderizar revisão
function renderReviewScreen() {
    document.getElementById('app').innerHTML = ReviewScreen;
    const container = document.getElementById('review-questions');
    container.innerHTML = '';

    appState.questions.forEach((question, index) => {
        const userAnswer = appState.userAnswers[index];
        const isCorrect = userAnswer === question.correct_option;
        
        const questionElement = document.createElement('div');
        questionElement.className = `p-6 border-l-4 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} rounded-lg`;
        
        questionElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-semibold text-gray-800">Questão ${index + 1}</h3>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${isCorrect ? '✓ Correta' : '✗ Incorreta'}
                </span>
            </div>
            
            <p class="text-gray-700 mb-4">${question.question_text}</p>
            
            <div class="space-y-2 mb-4">
                ${renderReviewOptions(question, userAnswer)}
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">Explicação:</h4>
                <p class="text-blue-700">${question.explanation}</p>
            </div>
        `;
        
        container.appendChild(questionElement);
    });
}

function renderReviewOptions(question, userAnswer) {
    const options = [
        question.option_a, question.option_b, question.option_c, 
        question.option_d, question.option_e
    ];
    
    return options.map((option, index) => {
        let style = 'p-3 border rounded-lg ';
        let indicator = '';
        
        if (index === question.correct_option) {
            style += 'bg-green-100 border-green-300 text-green-800';
            indicator = ' ✓ Resposta Correta';
        } else if (index === userAnswer && index !== question.correct_option) {
            style += 'bg-red-100 border-red-300 text-red-800';
            indicator = ' ✗ Sua Resposta';
        } else {
            style += 'bg-gray-50 border-gray-200 text-gray-700';
        }
        
        return `
            <div class="${style}">
                <span class="font-bold">${String.fromCharCode(65 + index)}.</span> 
                ${option}${indicator}
            </div>
        `;
    }).join('');
}