import { API_BASE, gerarKeyUnica, salvarLocalmente, carregarLocalmente } from './utils.js';

export async function salvarResultadoDashboard(categoria, subtema, nota) {
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
        
        const response = await fetch(`${API_BASE}/performance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            return { success: true, message: 'Resultado salvo com sucesso!' };
        } else {
            throw new Error('Erro ao salvar no servidor');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar no dashboard:', error);
        
        // Fallback: salvar localmente
        salvarResultadoLocalBackup(categoria, subtema, nota);
        return { 
            success: false, 
            message: 'Erro ao salvar. Dados guardados localmente.' 
        };
    }
}

function salvarResultadoLocalBackup(categoria, subtema, nota) {
    const pendingResults = carregarLocalmente('pendingDashboardResults') || [];
    pendingResults.push({
        categoria, subtema, nota,
        timestamp: new Date().toISOString()
    });
    salvarLocalmente('pendingDashboardResults', pendingResults);
}