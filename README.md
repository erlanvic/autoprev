1. Dor Escolhida e Por Que Ela Vale um Negócio
Problema
Muitos motoristas não realizam a manutenção preventiva dos seus veículos. A maioria só procura uma oficina quando o carro apresenta falhas ou quebra completamente.

Esse comportamento gera diversos problemas:

Gastos elevados com manutenção corretiva;
Imprevistos financeiros;
Riscos à segurança;
Perda de tempo com emergências;
Dificuldade em acompanhar o histórico do veículo.
Esse problema foi identificado a partir de uma experiência pessoal: frequentemente a manutenção do veículo é esquecida, fazendo com que reparos sejam realizados apenas após o surgimento de um defeito.

Por que vale um negócio?
A dor é:

Frequente;
Financeiramente relevante;
Fácil de entender;
Compartilhada por milhões de motoristas.
Quando um problema gera prejuízo financeiro recorrente, as pessoas tendem a buscar soluções que ajudem a evitá-lo.

O aplicativo "Carro em Dia" tem como objetivo reduzir os custos inesperados de manutenção através de lembretes, histórico e acompanhamento preventivo.

2. Tamanho de Mercado e Business Model Canvas
Mercado-Alvo
O público-alvo é composto por proprietários de veículos que utilizam seus carros diariamente e possuem dificuldade em controlar a manutenção preventiva.

Segmentos prioritários:

Proprietários de veículos particulares;
Motoristas de aplicativo;
Pequenas empresas com frotas reduzidas;
Pessoas com pouco conhecimento em mecânica.
O mercado automotivo brasileiro possui dezenas de milhões de veículos em circulação, o que representa um público potencial extremamente amplo para uma solução digital focada em manutenção preventiva.

Business Model Canvas
Segmentos de Clientes
Proprietários de veículos particulares;
Motoristas de aplicativo;
Pequenas frotas;
Pessoas que não possuem conhecimento técnico sobre mecânica.
Proposta de Valor
Evitar gastos inesperados;
Reduzir o risco de falhas mecânicas;
Organizar o histórico do veículo;
Receber alertas automáticos de manutenção;
Acompanhar os custos do carro de forma simples.
Canais
Aplicativos Android e iOS;
Redes sociais;
Parcerias com oficinas;
Marketing digital.
Relacionamento com Clientes
Notificações automáticas;
Suporte dentro do aplicativo;
Conteúdo educativo sobre manutenção preventiva.
Fontes de Receita
Assinatura Premium;
Comissões de oficinas parceiras;
Publicidade segmentada do setor automotivo.
Recursos Principais
Aplicativo mobile;
Banco de dados dos veículos;
Sistema de notificações;
Algoritmo de previsão de manutenção.
Atividades Principais
Desenvolvimento do aplicativo;
Manutenção da plataforma;
Aquisição de usuários;
Gestão de parcerias.
Parcerias Principais
Oficinas mecânicas;
Autopeças;
Seguradoras;
Empresas de inspeção veicular.
Estrutura de Custos
Hospedagem em nuvem;
Desenvolvimento;
Marketing;
Atendimento ao usuário.
3. Tese do MVP e O Que Ficou Manual de Propósito
Tese Principal
Se motoristas receberem lembretes simples e conseguirem registrar facilmente suas manutenções, eles utilizarão o aplicativo para acompanhar a saúde do veículo e evitar problemas futuros.

A hipótese que será validada é:

Motoristas possuem interesse em acompanhar a manutenção preventiva do veículo quando o processo é simples e gera economia financeira.

Funcionalidades do MVP
Cadastro de veículo;
Registro de quilometragem;
Registro de manutenções realizadas;
Histórico de serviços;
Alertas de manutenção preventiva;
Controle básico de gastos.
O Que Ficou Manual de Propósito
Para validar a ideia mais rapidamente, algumas funcionalidades avançadas não serão automatizadas inicialmente:

Cadastro manual da quilometragem;
Cadastro manual das manutenções;
Cadastro manual dos gastos;
Definição manual da média de quilômetros rodados por mês;
Alertas gerados por regras simples.
O Que Será Desenvolvido Apenas Após Validação
Integração com dispositivos OBD-II;
Diagnóstico automático do veículo;
Inteligência Artificial para previsão de falhas;
Recomendação personalizada por modelo de carro;
Integração com oficinas parceiras.

4. Mega Prompt Utilizado e Correções Solicitadas
Crie um aplicativo SaaS mobile-first chamado "AutoPrev", o guardião financeiro do veículo.

CONCEITO
O foco não é mecânica, é ECONOMIA. O app avisa o motorista antes que problemas caros aconteçam, mostrando quanto ele economiza com manutenção preventiva.

PÚBLICO-ALVO
Donos de veículos particulares, motoristas de aplicativo, pessoas com pouco conhecimento em mecânica e quem quer evitar gastos inesperados.

STACK
- Frontend: React + TypeScript + Tailwind
- Backend: Supabase (Auth, Postgres, RLS)
- Login: Google e e-mail/senha
- Gráficos: Recharts

DESIGN
- Inspirado em Nubank (cartões arredondados, hierarquia clara), Notion (minimalismo, muito espaço em branco) e Tesla App (visual do veículo, limpo e tecnológico)
- Cores: azul principal (#2563EB), branco, verde (#16A34A) para sucesso, amarelo (#F59E0B) para atenção, vermelho (#DC2626) para atrasado
- Fonte Inter, cantos arredondados, sombras suaves, animações sutis
- Navegação inferior (bottom tab) com: Início, Veículos, Gastos, Estatísticas, Perfil
- Botão flutuante "+" para nova manutenção ou novo gasto
- Suporte a modo escuro

BANCO DE DADOS (Supabase, com RLS: cada usuário só acessa seus dados)
- profiles: id, nome, avatar, km_medio_mensal
- vehicles: id, user_id, marca, modelo, ano, km_atual, placa (opcional), apelido
- maintenances: id, vehicle_id, tipo, data, km, valor, observacoes
  Tipos: troca de óleo, filtro de óleo, filtro de ar, pastilhas de freio, pneus, bateria, correia dentada, amortecedores, outros
- maintenance_rules: tipo, intervalo_km, intervalo_meses, custo_evitado_estimado
- expenses: id, vehicle_id, categoria, valor, data, observacoes
  Categorias: combustível, seguro, IPVA, licenciamento, oficina, lavagem, outros
- Suporte a múltiplos veículos por usuário, com seletor de veículo ativo no topo

TELAS DESTA PARTE
1. Login e Cadastro (Google + e-mail), onboarding curto de 3 passos
2. Veículos: lista, cadastro e edição
3. Nova Manutenção: formulário com tipo, data, km, valor e observações; ao salvar, atualiza o km do veículo
4. Histórico de Manutenções: lista em timeline com filtro por tipo e veículo
5. Gastos: registrar despesas por categoria, com totais mensal, anual e acumulado
6. Perfil: dados do usuário, km médio por mês, logout

Entregue tudo funcionando com autenticação e banco conectados. Use dados de exemplo só como estado vazio ilustrativo.


5. Endereço da Aplicação Publicada
https://autoprev.lovable.app/
