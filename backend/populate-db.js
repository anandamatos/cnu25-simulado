const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./questions.db');

const questionsPath = path.join(__dirname, '../data/output/questoes-formatadas.json');

console.log(`📖 Lendo questões de: ${questionsPath}`);

if (!fs.existsSync(questionsPath)) {
    console.error('❌ Arquivo de questões não encontrado!');
    process.exit(1);
}

const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

console.log(`📊 Encontradas ${questionsData.length} questões no JSON`);

db.serialize(() => {
    console.log('🗃️ Criando tabelas...');
    
    db.run(`DROP TABLE IF EXISTS questions`);
    db.run(`CREATE TABLE questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        option_e TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        explanation TEXT NOT NULL,
        subject_area VARCHAR(100) NOT NULL,
        knowledge_axis VARCHAR(50) NOT NULL,
        law_reference VARCHAR(50),
        difficulty INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ Tabela questions criada');

    const stmt = db.prepare(`INSERT INTO questions 
        (question_text, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, subject_area, knowledge_axis, law_reference) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    let inserted = 0;
    let errors = 0;

    console.log('📥 Inserindo questões...');

    questionsData.forEach((q) => {
        stmt.run([
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.option_e,
            q.correct_option,
            q.explanation,
            q.subject_area,
            q.knowledge_axis,
            q.law_reference || 'Lei 14.133/2021'
        ], function(err) {
            if (err) {
                console.error(`❌ Erro na questão ${q.id}: ${err.message}`);
                errors++;
            } else {
                inserted++;
                if (inserted % 50 === 0) {
                    console.log(`   Inseridas ${inserted} questões...`);
                }
            }
        });
    });

    stmt.finalize(() => {
        console.log(`\n🎉 POPULAÇÃO CONCLUÍDA!`);
        console.log(`✅ Questões inseridas: ${inserted}`);
        console.log(`❌ Erros: ${errors}`);
        
        db.get("SELECT COUNT(*) as total FROM questions", (err, row) => {
            if (err) {
                console.error("Erro ao verificar:", err);
            } else {
                console.log(`📊 Total no banco: ${row.total} questões`);
            }
            db.close();
        });
    });
});
