const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./questions.db');

console.log("🔍 VERIFICANDO QUESTÕES NO BANCO DE DADOS...");

// Verificar contagem total
db.get("SELECT COUNT(*) as total FROM questions", (err, row) => {
    if (err) {
        console.error("Erro:", err);
        return;
    }
    console.log(`📊 Total de questões no banco: ${row.total}`);
});

// Verificar distribuição por knowledge_axis
db.all("SELECT knowledge_axis, COUNT(*) as count FROM questions GROUP BY knowledge_axis", (err, rows) => {
    if (err) {
        console.error("Erro:", err);
        return;
    }
    console.log("\n🎯 Distribuição por Eixo:");
    rows.forEach(row => {
        console.log(`  ${row.knowledge_axis}: ${row.count} questões`);
    });
});

// Verificar distribuição por subject_area
db.all("SELECT subject_area, COUNT(*) as count FROM questions GROUP BY subject_area", (err, rows) => {
    if (err) {
        console.error("Erro:", err);
        return;
    }
    console.log("\n📚 Distribuição por Assunto:");
    rows.forEach(row => {
        console.log(`  ${row.subject_area}: ${row.count} questões`);
    });
});

// Verificar algumas questões de exemplo
db.all("SELECT id, question_text, knowledge_axis, subject_area FROM questions LIMIT 5", (err, rows) => {
    if (err) {
        console.error("Erro:", err);
        return;
    }
    console.log("\n🔎 Primeiras 5 questões:");
    rows.forEach(row => {
        console.log(`  ID ${row.id}: ${row.knowledge_axis} - ${row.subject_area}`);
        console.log(`     Pergunta: ${row.question_text.substring(0, 50)}...`);
    });
    
    db.close();
});