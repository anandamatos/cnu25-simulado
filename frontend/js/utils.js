// Constantes globais
export const API_BASE = 'http://localhost:3000/api';
export const EIXOS_FIXOS = [
    'Eixo 1 - Ética e Filosofia',
    'Eixo 2 - Direito Constitucional',
    'Eixo 3 - Direito Administrativo', 
    'Eixo 4 - Licitações e LRF',
    'Eixo 5 - Direito Financeiro',
    'Eixo 6 - Direito Tributário'
];

export const MATERIAS_POR_EIXO = {
    'Eixo 4 - Licitações e LRF': ['Lei 14.133/2021', 'Lei 8.666/1993', 'LRF']
};

// Funções auxiliares
export const formatarPercentual = (valor) => {
    if (valor === undefined || valor === null) return '--';
    return `${valor.toFixed(2)}%`;
};

export const gerarKeyUnica = (texto) => {
    return texto.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50);
};