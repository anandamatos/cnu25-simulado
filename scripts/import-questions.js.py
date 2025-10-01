const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/input/questoes.txt');
const outputPath = path.join(__dirname, 'questions.json');

console.log('📥 Lendo arquivo de questões...');

const conteudo = fs.readFileSync(inputPath, 'utf8');
const blocos = conteudo.split('**Questão ').filter(bloco => bloco.trim());

const questões = [];

blocos.forEach((bloco, index) => {
    try {
        // Extrair número da questão
        const numeroMatch = bloco.match(/^(\d+)/);
        if (!numeroMatch) return;
        
        const numero = parseInt(numeroMatch[1]);
        
        // Extrair enunciado
        const enunciadoMatch = bloco.match(/\*\*BLOCO 1: Questão e Alternativas\*\*\s*(.*?)(?=A\))/s);
        const enunciado = enunciadoMatch ? enunciadoMatch[1].trim() : '';
        
        // Extrair alternativas
        const alternativasMatch = bloco.match(/A\)(.*?)B\)(.*?)C\)(.*?)D\)(.*?)E\)(.*?)\*\*BLOCO 2:/s);
        if (!alternativasMatch) return;
        
        const alternativas = [
            alternativasMatch[1].trim(),
            alternativasMatch[2].trim(),
            alternativasMatch[3].trim(),
            alternativasMatch[4].trim(),
            alternativasMatch[5].trim()
        ];
        
        // Extrair resposta correta
        const respostaMatch = bloco.match(/\*\*BLOCO 2: Chave de Resposta\*\*\s*([A-E])/);
        const respostaCorreta = respostaMatch ? 
            ['A', 'B', 'C', 'D', 'E'].indexOf(respostaMatch[1]) : 0;
        
        // Extrair explicação
        const explicacaoMatch = bloco.match(/\*\*BLOCO 3: Justificativa Completa\*\*\s*(.*?)(?=\*\*|$)/s);
        const explicacao = explicacaoMatch ? explicacaoMatch[1].trim() : '';
        
        // Determinar eixo, tema e subtema baseado no número
        let eixo = "Eixo 4";
        let tema = "Licitações";
        let subtema = "";
        
        if (numero <= 10) {
            subtema = "Dispensa/Modalidades (1-10)";
        } else if (numero <= 20) {
            subtema = "Dispensa/Modalidades (11-20)";
        } else if (numero <= 40) {
            subtema = "Dispensa/Modalidades (21-40)";
        } else if (numero <= 60) {
            subtema = "Contratos (41-60)";
        } else if (numero <= 80) {
            subtema = "Contratos (61-80)";
        } else {
            subtema = "Outros Temas";
        }
        
        // Determinar dificuldade
        const dificuldade = Math.random() > 0.6 ? "media" : "facil";
        
        questões.push({
            id: numero,
            enunciado: enunciado,
            alternativas: alternativas,
            resposta_correta: respostaCorreta,
            explicacao: explicacao,
            eixo: eixo,
            tema: tema,
            subtema: subtema,
            dificuldade: dificuldade
        });
        
    } catch (error) {
        console.log(`❌ Erro na questão ${index + 1}:`, error.message);
    }
});

// Ordenar por ID
questões.sort((a, b) => a.id - b.id);

const questionsData = {
    "questoes": questões
};

// Salvar
fs.writeFileSync(outputPath, JSON.stringify(questionsData, null, 2));
console.log(`✅ ${questões.length} questões importadas para questions.json`);

// Verificar
console.log('\n📊 Primeira questão importada:');
console.log(JSON.stringify(questões[0], null, 2));