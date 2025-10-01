const sqlite3 = require('sqlite3').verbose();

// Middleware de autenticação simples
function authMiddleware(req, res, next) {
    // Em produção, usar JWT ou sessões
    const userId = req.headers['user-id'] || 1; // Default para usuário 1
    req.userId = parseInt(userId);
    next();
}

// Rotas de usuário
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Hash da senha (em produção, usar bcrypt)
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    
    db.run(query, [username, email, password], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Usuário criado com sucesso' });
    });
});

app.get('/api/user/stats', authMiddleware, (req, res) => {
    const userId = req.userId;
    
    // Buscar estatísticas do usuário
    const query = `
        SELECT 
            COUNT(*) as total_simulados,
            AVG(percentage) as media_geral,
            MAX(percentage) as melhor_nota
        FROM quiz_sessions 
        WHERE user_id = ?
    `;
    
    db.get(query, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});