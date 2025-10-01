const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Função para carregar JSON
function carregarJSON(caminho) {
    try {
        if (fs.existsSync(caminho)) {
            const data = fs.readFileSync(caminho, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Erro ao carregar JSON:', caminho, error);
    }
    return null;
}

// Converter questões do formato específico para o formato padrão
function converterQuestoesFormatoEspecifico(dados) {
    if (!dados || !dados.questoes || !Array.isArray(dados.questoes)) {
        return [];
    }

    return dados.questoes.map((questao, index) => {
        // Converter alternativas de objeto para array
        const alternativasObj = questao.alternativas || {};
        const alternativas = Object.values(alternativasObj);
        
        // Converter gabarito de letra para número (A=0, B=1, C=2, etc)
        const gabaritoLetra = questao.gabarito;
        const correct_option = gabaritoLetra ? gabaritoLetra.charCodeAt(0) - 65 : 0;

        return {
            id: questao.id || (index + 1),
            enunciado: questao.enunciado || '',
            alternativas: alternativas,
            correct_option: correct_option,
            tipo: "especificos",
            eixo: "Eixo 4 - Licitações e LRF",
            tema: "Lei 14.133/2021",
            subtema: "Modalidades & Dispensa: 1 a 10"
        };
    });
}

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// API - Questões
app.get('/api/questoes', (req, res) => {
    console.log('📥 GET /api/questoes');
    
    const questionsPath = path.join(__dirname, 'data/questoes-formatadas.json');
    const questions = carregarJSON(questionsPath) || [];
    
    console.log(`✅ Retornando ${questions.length} questões`);
    res.json(questions);
});

// API - Bloco Modalidades Dispensa (CORRIGIDA)
app.get('/api/bloco-questions/modalidades-dispensa-1a10', (req, res) => {
    console.log('📥 GET /api/bloco-questions/modalidades-dispensa-1a10');
    
    // Carregar do arquivo específico
    const modalidadesPath = path.join(__dirname, 'meu_banco_questoes/1licitacoesLrf/1modalidadesDispensa/modalidadesDispensa1a10.json');
    const dadosEspecificos = carregarJSON(modalidadesPath);
    
    let questions = [];
    
    if (dadosEspecificos && dadosEspecificos.questoes) {
        console.log(`✅ Encontradas ${dadosEspecificos.questoes.length} questões no formato específico`);
        // Converter do formato específico para o formato padrão
        questions = converterQuestoesFormatoEspecifico(dadosEspecificos);
    } else {
        console.log('🔄 Usando fallback para questões gerais...');
        // Fallback para questões gerais
        const questionsPath = path.join(__dirname, 'data/questoes-formatadas.json');
        const allQuestions = carregarJSON(questionsPath) || [];
        
        questions = allQuestions
            .filter(q => q && q.tipo === 'especificos' && q.eixo === 'Eixo 4 - Licitações e LRF' && q.tema === 'Lei 14.133/2021')
            .slice(0, 10);
    }
    
    console.log(`✅ Retornando ${questions.length} questões para o bloco`);
    res.json(questions);
});

// API - Performance
app.get('/api/performance', (req, res) => {
    console.log('📥 GET /api/performance');
    
    const performancePath = path.join(__dirname, 'data/performance-data.json');
    const performanceData = carregarJSON(performancePath) || [];
    
    console.log(`✅ Retornando ${performanceData.length} itens de performance`);
    res.json(performanceData);
});

app.post('/api/performance', (req, res) => {
    try {
        console.log('📝 POST /api/performance:', req.body);
        
        const performancePath = path.join(__dirname, 'data/performance-data.json');
        const existingData = carregarJSON(performancePath) || [];
        
        const newData = req.body;
        
        // Verificar se já existe um item com a mesma key
        const existingIndex = existingData.findIndex(item => item.key === newData.key);
        
        if (existingIndex !== -1) {
            // Atualizar item existente
            existingData[existingIndex].scores = [...existingData[existingIndex].scores, ...newData.scores];
            console.log(`🔄 Atualizado item existente: ${newData.key}`);
        } else {
            // Adicionar novo item
            existingData.push(newData);
            console.log(`✅ Adicionado novo item: ${newData.key}`);
        }
        
        // Salvar de volta
        fs.writeFileSync(performancePath, JSON.stringify(existingData, null, 2));
        
        console.log(`💾 Dados salvos. Total: ${existingData.length} itens`);
        res.json({ 
            success: true, 
            message: 'Dados salvos com sucesso',
            totalItems: existingData.length 
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar performance:', error);
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

// API - Estatísticas do Dashboard
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const performancePath = path.join(__dirname, 'data/performance-data.json');
        const performanceData = carregarJSON(performancePath) || [];
        
        // Calcular estatísticas
        const todosScores = performanceData.flatMap(item => item.scores || []);
        const totalTestes = todosScores.length;
        const mediaGeral = totalTestes > 0 
            ? todosScores.reduce((sum, score) => sum + score, 0) / totalTestes
            : 0;
        
        const stats = {
            mediaGeral: parseFloat(mediaGeral.toFixed(2)),
            totalTestes: totalTestes,
            meta: 85,
            ultimoSimulado: todosScores.length > 0 ? todosScores[todosScores.length - 1] : 0
        };
        
        console.log('📊 Estatísticas calculadas:', stats);
        res.json(stats);
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        res.json({
            mediaGeral: 0,
            totalTestes: 0,
            meta: 85,
            ultimoSimulado: 0
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

// Log de requisições
app.use((req, res, next) => {
    console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});