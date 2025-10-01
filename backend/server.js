const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexão com o banco de dados
const db = new sqlite3.Database('./questions.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite.');
    }
});

// Inicializar banco de dados
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enunciado TEXT NOT NULL,
        alternativas TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        tipo TEXT,
        eixo TEXT,
        tema TEXT,
        subtema TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_area TEXT,
        knowledge_axis TEXT,
        num_questions INTEGER,
        score INTEGER,
        percentage REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// Rota principal - servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Rota para obter questões
app.get('/api/questoes', (req, res) => {
    const sql = `SELECT * FROM questions`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar questões:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Converter alternativas de string JSON para array
        const questions = rows.map(row => ({
            ...row,
            alternativas: JSON.parse(row.alternativas)
        }));
        
        res.json(questions);
    });
});

// Rota para obter questões da prova com filtros
app.get('/api/prova-questions', (req, res) => {
    const { tipo, categoria, subcategoria, numQuestions } = req.query;
    
    let sql = `SELECT * FROM questions WHERE 1=1`;
    const params = [];

    if (tipo) {
        sql += ` AND tipo = ?`;
        params.push(tipo);
    }

    if (categoria && categoria !== 'completa') {
        if (tipo === 'gerais') {
            sql += ` AND tema = ?`;
            params.push(categoria);
        } else if (tipo === 'especificos') {
            sql += ` AND eixo = ?`;
            params.push(categoria);
            
            if (subcategoria) {
                sql += ` AND tema = ?`;
                params.push(subcategoria);
            }
        }
    }

    // Ordenar randomicamente e limitar pelo número de questões
    sql += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(parseInt(numQuestions) || 10);

    console.log('📋 SQL:', sql, 'Params:', params);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar questões:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Converter alternativas de string JSON para array
        const questions = rows.map(row => ({
            ...row,
            alternativas: JSON.parse(row.alternativas)
        }));
        
        console.log(`✅ Retornando ${questions.length} questões`);
        res.json(questions);
    });
});

// Rota para obter bloco específico de questões
app.get('/api/bloco-questions/:bloco', (req, res) => {
    const { bloco } = req.params;
    
    let sql = '';
    let params = [];

    if (bloco === 'modalidades-dispensa-1a10') {
        sql = `SELECT * FROM questions 
               WHERE tipo = 'especificos' 
               AND eixo = 'Eixo 4 - Licitações e LRF' 
               AND tema = 'Lei 14.133/2021' 
               AND subtema LIKE '%Modalidades%' 
               LIMIT 10`;
    } else {
        // Bloco padrão - 10 questões aleatórias do eixo
        sql = `SELECT * FROM questions 
               WHERE tipo = 'especificos' 
               AND eixo = ? 
               ORDER BY RANDOM() 
               LIMIT 10`;
        params.push(bloco);
    }

    console.log('📋 Buscando bloco:', bloco, 'SQL:', sql);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar questões do bloco:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        const questions = rows.map(row => ({
            ...row,
            alternativas: JSON.parse(row.alternativas)
        }));
        
        console.log(`✅ Retornando ${questions.length} questões do bloco ${bloco}`);
        res.json(questions);
    });
});

// Rota para salvar resultados do quiz
app.post('/api/quiz-results', (req, res) => {
    const { subjectArea, knowledgeAxis, numQuestions, score, percentage } = req.body;
    
    const sql = `INSERT INTO quiz_results (subject_area, knowledge_axis, num_questions, score, percentage) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [subjectArea, knowledgeAxis, numQuestions, score, percentage], function(err) {
        if (err) {
            console.error('Erro ao salvar resultado:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`✅ Resultado salvo: ${score}/${numQuestions} (${percentage}%)`);
        res.json({ id: this.lastID, message: 'Resultado salvo com sucesso' });
    });
});

// Rota para obter dados de performance
app.get('/api/performance', (req, res) => {
    try {
        const performancePath = path.join(__dirname, 'data/performance-data.json');
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(performancePath)) {
            console.log('📁 Arquivo performance-data.json não encontrado, criando arquivo padrão...');
            
            // Criar arquivo com dados padrão
            const defaultData = [
                {
                    "key": "modalidades-dispensa-1a10",
                    "eixo": "Eixo 4 - Licitações e LRF",
                    "tema": "Lei 14.133/2021",
                    "subtema": "Modalidades & Dispensa: 1 a 10",
                    "grupo": "especificos",
                    "scores": [20, 50, 90, 100, 100, 100, 100, 100]
                },
                {
                    "key": "modalidades-dispensa-11a20",
                    "eixo": "Eixo 4 - Licitações e LRF",
                    "tema": "Lei 14.133/2021",
                    "subtema": "Modalidades & Dispensa: 11 a 20",
                    "grupo": "especificos",
                    "scores": [50, 100, 100, 100, 100]
                },
                {
                    "key": "modalidades-dispensa-21a40",
                    "eixo": "Eixo 4 - Licitações e LRF",
                    "tema": "Lei 14.133/2021",
                    "subtema": "Modalidades & Dispensa: 21 a 40",
                    "grupo": "especificos",
                    "scores": [80]
                }
            ];
            
            fs.writeFileSync(performancePath, JSON.stringify(defaultData, null, 2));
            console.log('✅ Arquivo performance-data.json criado com dados padrão');
            res.json(defaultData);
            return;
        }
        
        // Ler e parsear o arquivo
        const rawData = fs.readFileSync(performancePath, 'utf8');
        const performanceData = JSON.parse(rawData);
        
        console.log(`✅ Dados de performance carregados: ${performanceData.length} itens`);
        res.json(performanceData);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados de performance:', error);
        res.status(500).json({ 
            error: 'Erro ao carregar dados de performance',
            details: error.message 
        });
    }
});

// Rota para salvar/atualizar dados de performance
app.post('/api/performance', (req, res) => {
    try {
        const performancePath = path.join(__dirname, 'data/performance-data.json');
        const newData = req.body;
        
        console.log('📝 Recebendo dados para salvar:', newData);
        
        let existingData = [];
        
        // Ler dados existentes se o arquivo existir
        if (fs.existsSync(performancePath)) {
            const rawData = fs.readFileSync(performancePath, 'utf8');
            existingData = JSON.parse(rawData);
        }
        
        // Verificar se já existe um item com a mesma key
        const existingIndex = existingData.findIndex(item => item.key === newData.key);
        
        if (existingIndex !== -1) {
            // Atualizar item existente - adicionar novos scores ao array existente
            existingData[existingIndex].scores = [...existingData[existingIndex].scores, ...newData.scores];
            console.log(`🔄 Atualizado item existente: ${newData.key}`);
        } else {
            // Adicionar novo item
            existingData.push(newData);
            console.log(`✅ Adicionado novo item: ${newData.key}`);
        }
        
        // Salvar de volta no arquivo
        fs.writeFileSync(performancePath, JSON.stringify(existingData, null, 2));
        
        console.log(`💾 Dados salvos com sucesso. Total de itens: ${existingData.length}`);
        res.json({ 
            success: true, 
            message: 'Dados salvos com sucesso',
            totalItems: existingData.length 
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados de performance:', error);
        res.status(500).json({ 
            error: 'Erro ao salvar dados de performance',
            details: error.message 
        });
    }
});

// Rota para obter estatísticas do dashboard
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const performancePath = path.join(__dirname, 'data/performance-data.json');
        
        if (!fs.existsSync(performancePath)) {
            return res.json({
                mediaGeral: 0,
                totalTestes: 0,
                meta: 85,
                ultimoSimulado: 0
            });
        }
        
        const rawData = fs.readFileSync(performancePath, 'utf8');
        const performanceData = JSON.parse(rawData);
        
        // Calcular estatísticas
        const todosScores = performanceData.flatMap(item => item.scores || []);
        const totalTestes = todosScores.length;
        const mediaGeral = totalTestes > 0 
            ? todosScores.reduce((sum, score) => sum + score, 0) / totalTestes
            : 0;
        
        const ultimoSimulado = todosScores.length > 0 ? todosScores[todosScores.length - 1] : 0;
        
        const stats = {
            mediaGeral: parseFloat(mediaGeral.toFixed(2)),
            totalTestes: totalTestes,
            meta: 85,
            ultimoSimulado: ultimoSimulado
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

// Rota para obter todos os resultados de quiz
app.get('/api/quiz-results', (req, res) => {
    const sql = `SELECT * FROM quiz_results ORDER BY timestamp DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar resultados:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json(rows);
    });
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Dashboard disponível em http://localhost:${PORT}/dashboard.html`);
    initializeDatabase();
});

// Tratamento graceful de shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar banco de dados:', err.message);
        } else {
            console.log('✅ Conexão com banco de dados fechada.');
        }
        process.exit(0);
    });
});