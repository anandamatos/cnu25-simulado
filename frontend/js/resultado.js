class GerenciadorResultados {
    constructor() {
        this.resultado = null;
        this.questoes = [];
        
        this.inicializarElementos();
        this.carregarResultado();
        this.inicializarEventos();
    }

    inicializarElementos() {
        this.elements = {
            // Resumo
            notaFinal: document.getElementById('nota-final'),
            totalQuestoes: document.getElementById('total-questoes'),
            totalAcertos: document.getElementById('total-acertos'),
            totalErros: document.getElementById('total-erros'),
            percentual: document.getElementById('percentual'),
            tempoGasto: document.getElementById('tempo-gasto'),
            
            // Lista de questões
            questaoLista: document.getElementById('questoes-lista'),
            
            // Ações
            btnRevisarErros: document.getElementById('btn-revisar-erros'),
            btnNovaProva: document.getElementById('btn-nova-prova'),
            btnExportar: document.getElementById('btn-exportar'),
            
            // Modal
            modalQuestao: document.getElementById('modal-questao'),
            modalTitulo: document.getElementById('modal-titulo'),
            enunciadoModal: document.getElementById('enunciado-modal'),
            alternativasModal: document.getElementById('alternativas-modal'),
            textoExplicacao: document.getElementById('texto-explicacao'),
            btnFecharModal: document.getElementById('btn-fechar-modal')
        };
    }

    async carregarResultado() {
        try {
            // Carregar resultado do localStorage
            const resultadoSalvo = localStorage.getItem('ultimoResultado');
            
            if (!resultadoSalvo) {
                throw new Error('Nenhum resultado encontrado');
            }
            
            this.resultado = JSON.parse(resultadoSalvo);
            this.mostrarResumo();
            this.mostrarDetalhamentoQuestoes();
            
        } catch (error) {
            console.error('Erro ao carregar resultado:', error);
            alert('Erro ao carregar resultados. Voltando para a página inicial.');
            window.location.href = '/';
        }
    }

    mostrarResumo() {
        const { totalQuestoes, acertos, percentual, tempoDecorrido } = this.resultado;
        const erros = totalQuestoes - acertos;
        
        // Atualizar elementos do resumo
        this.elements.notaFinal.textContent = acertos;
        this.elements.totalQuestoes.textContent = totalQuestoes;
        this.elements.totalAcertos.textContent = acertos;
        this.elements.totalErros.textContent = erros;
        this.elements.percentual.textContent = `${percentual.toFixed(1)}%`;
        this.elements.tempoGasto.textContent = this.formatarTempo(tempoDecorrido);
        
        // Aplicar cores baseadas no desempenho
        this.aplicarCoresDesempenho(percentual);
    }

    aplicarCoresDesempenho(percentual) {
        const notaElement = this.elements.notaFinal;
        
        if (percentual >= 70) {
            notaElement.style.color = '#28a745'; // Verde
        } else if (percentual >= 50) {
            notaElement.style.color = '#ffc107'; // Amarelo
        } else {
            notaElement.style.color = '#dc3545'; // Vermelho
        }
    }

    formatarTempo(milissegundos) {
        const minutos = Math.floor(milissegundos / 60000);
        const segundos = Math.floor((milissegundos % 60000) / 1000);
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    mostrarDetalhamentoQuestoes() {
        this.elements.questaoLista.innerHTML = '';
        
        this.resultado.detalhes.forEach((detalhe, index) => {
            const questaoItem = this.criarElementoQuestao(detalhe, index);
            this.elements.questaoLista.appendChild(questaoItem);
        });
    }

    criarElementoQuestao(detalhe, index) {
        const div = document.createElement('div');
        div.className = `questao-item ${detalhe.acertou ? 'acerto' : 'erro'}`;
        
        const statusTexto = detalhe.acertou ? 'Acertou' : 'Errou';
        const statusClasse = detalhe.acertou ? 'status-acerto' : 'status-erro';
        const respostaUsuario = detalhe.respostaUsuario !== undefined ? 
            String.fromCharCode(65 + detalhe.respostaUsuario) : 'Não respondida';
        const respostaCorreta = String.fromCharCode(65 + detalhe.respostaCorreta);
        
        div.innerHTML = `
            <div class="questao-numero">${index + 1}</div>
            <div class="questao-resumo">
                <div><strong>Questão ${index + 1}</strong></div>
                <div class="questao-status">
                    <span class="${statusClasse}">${statusTexto}</span>
                    <span>Sua resposta: ${respostaUsuario}</span>
                    <span>Resposta correta: ${respostaCorreta}</span>
                </div>
            </div>
            <div class="questao-acao">
                <button class="btn btn-sm btn-outline btn-ver-detalhes" data-indice="${index}">
                    Ver Detalhes
                </button>
            </div>
        `;
        
        return div;
    }

    inicializarEventos() {
        // Ações principais
        this.elements.btnRevisarErros.addEventListener('click', () => this.revisarErros());
        this.elements.btnNovaProva.addEventListener('click', () => this.novaProva());
        this.elements.btnExportar.addEventListener('click', () => this.exportarResultado());
        
        // Modal
        this.elements.btnFecharModal.addEventListener('click', () => this.fecharModal());
        this.elements.modalQuestao.addEventListener('click', (e) => {
            if (e.target === this.elements.modalQuestao) {
                this.fecharModal();
            }
        });
        
        // Event delegation para botões de detalhes
        this.elements.questaoLista.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ver-detalhes')) {
                const indice = parseInt(e.target.dataset.indice);
                this.mostrarDetalhesQuestao(indice);
            }
        });
        
        // Teclado para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modalQuestao.classList.contains('active')) {
                this.fecharModal();
            }
        });
    }

    revisarErros() {
        const questoesErradas = this.resultado.detalhes
            .filter(detalhe => !detalhe.acertou)
            .map((detalhe, index) => detalhe.questao);
        
        if (questoesErradas.length === 0) {
            alert('Parabéns! Você não errou nenhuma questão.');
            return;
        }
        
        // Salvar questões erradas para revisão
        localStorage.setItem('questoesParaRevisao', JSON.stringify(questoesErradas));
        alert(`Você tem ${questoesErradas.length} questão(ões) para revisar.`);
        // Aqui poderia redirecionar para uma página de revisão específica
    }

    novaProva() {
        window.location.href = '/';
    }

    exportarResultado() {
        const resultadoTexto = this.gerarTextoExportacao();
        this.baixarArquivo(resultadoTexto, 'resultado-simulado.txt', 'text/plain');
    }

    gerarTextoExportacao() {
        const { totalQuestoes, acertos, percentual, tempoDecorrido } = this.resultado;
        const erros = totalQuestoes - acertos;
        
        let texto = `RESULTADO DO SIMULADO CNU\n`;
        texto += `========================\n\n`;
        texto += `Pontuação: ${acertos}/${totalQuestoes}\n`;
        texto += `Aproveitamento: ${percentual.toFixed(1)}%\n`;
        texto += `Tempo Gasto: ${this.formatarTempo(tempoDecorrido)}\n\n`;
        texto += `DETALHAMENTO POR QUESTÃO:\n`;
        texto += `=======================\n\n`;
        
        this.resultado.detalhes.forEach(detalhe => {
            const status = detalhe.acertou ? '✅ ACERTO' : '❌ ERRO';
            const respostaUsuario = detalhe.respostaUsuario !== undefined ? 
                String.fromCharCode(65 + detalhe.respostaUsuario) : 'N/A';
            const respostaCorreta = String.fromCharCode(65 + detalhe.respostaCorreta);
            
            texto += `Questão ${detalhe.questao}: ${status}\n`;
            texto += `Sua resposta: ${respostaUsuario} | Resposta correta: ${respostaCorreta}\n`;
            texto += `---\n`;
        });
        
        return texto;
    }

    baixarArquivo(conteudo, nomeArquivo, tipoConteudo) {
        const arquivo = new Blob([conteudo], { type: tipoConteudo });
        const url = URL.createObjectURL(arquivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async mostrarDetalhesQuestao(indice) {
        const detalhe = this.resultado.detalhes[indice];
        
        // Carregar questão completa (se disponível)
        const questaoCompleta = await this.carregarQuestaoCompleta(indice);
        
        // Atualizar modal
        this.elements.modalTitulo.textContent = `Questão ${indice + 1}`;
        this.elements.enunciadoModal.innerHTML = this.formatarTexto(detalhe.enunciado);
        
        // Mostrar alternativas
        this.mostrarAlternativasModal(questaoCompleta, detalhe);
        
        // Mostrar explicação (se disponível)
        this.mostrarExplicacao(questaoCompleta);
        
        // Abrir modal
        this.elements.modalQuestao.classList.add('active');
    }

    async carregarQuestaoCompleta(indice) {
        // Tentar carregar questão completa do bloco original
        // Por enquanto, retornamos os dados básicos
        return {
            alternativas: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D', 'Alternativa E'],
            explicacao: 'Explicação detalhada da questão...'
        };
    }

    mostrarAlternativasModal(questaoCompleta, detalhe) {
        this.elements.alternativasModal.innerHTML = '';
        
        const alternativasLetras = ['A', 'B', 'C', 'D', 'E'];
        
        // Usar alternativas da questão completa ou padrão
        const alternativas = questaoCompleta.alternativas || 
            ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D', 'Alternativa E'];
        
        alternativas.forEach((alternativa, index) => {
            const div = document.createElement('div');
            div.className = 'alternativa-modal';
            
            const isCorreta = index === detalhe.respostaCorreta;
            const isSelecionada = index === detalhe.respostaUsuario;
            const isErro = isSelecionada && !isCorreta;
            
            if (isCorreta) {
                div.classList.add('correta');
            }
            if (isSelecionada && !detalhe.acertou) {
                div.classList.add('selecionada', 'incorreta');
            }
            
            div.innerHTML = `
                <div class="marcador-alternativa">${alternativasLetras[index]}</div>
                <div class="texto-alternativa">${this.formatarTexto(alternativa)}</div>
            `;
            
            this.elements.alternativasModal.appendChild(div);
        });
    }

    mostrarExplicacao(questaoCompleta) {
        if (questaoCompleta.explicacao) {
            this.elements.textoExplicacao.textContent = questaoCompleta.explicacao;
        } else {
            this.elements.textoExplicacao.textContent = 'Explicação não disponível para esta questão.';
        }
    }

    formatarTexto(texto) {
        return texto
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    fecharModal() {
        this.elements.modalQuestao.classList.remove('active');
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new GerenciadorResultados();
});