import os
import json
import glob

def corrigir_estrutura_json(diretorio_base):
    """Corrige a estrutura dos arquivos JSON para o formato esperado."""
    
    arquivos_json = glob.glob(os.path.join(diretorio_base, "**/*.json"), recursive=True)
    
    print(f"🔍 Encontrados {len(arquivos_json)} arquivos JSON")
    
    for arquivo_path in arquivos_json:
        print(f"\n📁 Processando: {arquivo_path}")
        
        try:
            with open(arquivo_path, 'r', encoding='utf-8') as f:
                conteudo = f.read().strip()
            
            # Tentar parsear como JSON
            dados = json.loads(conteudo)
            
            # Verificar a estrutura atual e converter para o formato esperado
            if isinstance(dados, list):
                # Se é uma lista direta, assumir que são as questões
                nova_estrutura = {
                    "questions": dados
                }
                print("✅ Convertendo: Lista direta → estrutura com 'questions'")
                
            elif "questions" in dados:
                # Já tem a estrutura correta
                print("✅ Estrutura já está correta")
                continue
                
            else:
                # Tentar encontrar questões em outras estruturas
                print("❌ Estrutura não reconhecida. Verificando alternativas...")
                
                # Procurar por arrays que possam ser questões
                for chave, valor in dados.items():
                    if isinstance(valor, list) and len(valor) > 0:
                        primeiro_item = valor[0]
                        if isinstance(primeiro_item, dict) and 'enunciado' in primeiro_item:
                            nova_estrutura = {
                                "questions": valor
                            }
                            print(f"✅ Convertendo: Chave '{chave}' → estrutura com 'questions'")
                            break
                else:
                    print("❌ Não foi possível identificar a estrutura das questões")
                    continue
            
            # Salvar o arquivo corrigido
            with open(arquivo_path, 'w', encoding='utf-8') as f:
                json.dump(nova_estrutura, f, ensure_ascii=False, indent=2)
            
            print(f"💾 Arquivo corrigido e salvo: {arquivo_path}")
            
        except json.JSONDecodeError as e:
            print(f"❌ Erro ao decodificar JSON: {e}")
        except Exception as e:
            print(f"❌ Erro ao processar arquivo: {e}")

def criar_exemplo_json():
    """Cria um arquivo de exemplo com a estrutura correta."""
    
    exemplo = {
        "questions": [
            {
                "enunciado": "Qual é a modalidade de dispensa de licitação prevista no art. 24 da Lei 8.666/93?",
                "alternativas": [
                    "Dispensa por inexigibilidade",
                    "Dispensa por inviabilidade de competição", 
                    "Dispensa para contratação de artista consagrado",
                    "Dispensa por emergência",
                    "Dispensa por valor estimado"
                ],
                "respostaCorreta": 2
            },
            {
                "enunciado": "A dispensa de licitação para aquisição de bens necessários à defesa nacional deve ser fundamentada em:",
                "alternativas": [
                    "Conveniência administrativa",
                    "Razões de oportunidade e conveniência",
                    "Segurança nacional",
                    "Economicidade",
                    "Todos os anteriores"
                ],
                "respostaCorreta": 2
            }
        ]
    }
    
    caminho_exemplo = "meu_banco_questoes/exemplo_estrutura_correta.json"
    os.makedirs(os.path.dirname(caminho_exemplo), exist_ok=True)
    
    with open(caminho_exemplo, 'w', encoding='utf-8') as f:
        json.dump(exemplo, f, ensure_ascii=False, indent=2)
    
    print(f"📝 Exemplo criado: {caminho_exemplo}")

if __name__ == "__main__":
    print("🛠️  CORRETOR DE ESTRUTURA JSON")
    print("=" * 50)
    
    diretorio_base = "meu_banco_questoes"
    
    # Criar um exemplo primeiro
    criar_exemplo_json()
    
    # Corrigir arquivos existentes
    corrigir_estrutura_json(diretorio_base)
    
    print("\n🎉 Processo concluído!")
    print("\n📋 PRÓXIMOS PASSOS:")
    print("1. Verifique o arquivo de exemplo criado")
    print("2. Execute novamente: python3 auto-import.py")
    print("3. Se ainda não funcionar, compartilhe um trecho do seu JSON para análise")