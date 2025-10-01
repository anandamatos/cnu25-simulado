const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./questions.db');

console.log('📥 Importando seus resultados de simulado...');

// Seus dados reais
const seusResultados = [
    { key: "modalidadesDispensa1a10", scores: [20, 50, 90, 100, 100, 100, 100, 100], eixo: "Eixo 4", tema: "Licitações", subtema: "Dispensa/Modalidades (1-10)", grupo: "especificos" },
    { key: "modalidadesDispensa11a20", scores: [50, 100, 100, 100, 100], eixo: "Eixo 4", tema: "Licitações", subtema: "Dispensa/Modalidades (11-20)", grupo: "especificos" },
    { key: "modalidadesDispensa21a40", scores: [80], eixo: "Eixo 4", tema: "Licitações", subtema: "Dispensa/Modalidades (21-40)", grupo: "especificos" }
];

// Criar tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS performance_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    key TEXT UNIQUE,
    scores TEXT,
    eixo TEXT,
    tema TEXT,
    subtema TEXT,
    grupo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

const stmt = db.prepare(`INSERT OR REPLACE INTO performance_data 
    (user_id, key, scores, eixo, tema, subtema, grupo) 
    VALUES (1, ?, ?, ?, ?, ?, ?)`);

let inserted = 0;

seusResultados.forEach(item => {
    stmt.run([
        item.key,
        JSON.stringify(item.scores),
        item.eixo,
        item.tema,
        item.subtema,
        item.grupo
    ], function(err) {
        if (err) {
            console.error(`❌ Erro em ${item.key}:`, err);
        } else {
            inserted++;
            console.log(`✅ ${item.subtema}: ${item.scores.length} testes`);
        }
    });
});

stmt.finalize(() => {
    console.log(`\n🎉 Dados importados: ${inserted} registros`);
    
    // Verificar
    db.all("SELECT key, subtema, json_array_length(scores) as num_testes FROM performance_data", (err, rows) => {
        if (err) {
            console.error("Erro ao verificar:", err);
        } else {
            console.log("\n📊 Dados no banco:");
            rows.forEach(row => {
                console.log(`   ${row.subtema}: ${row.num_testes} testes`);
            });
        }
        db.close();
    });
});