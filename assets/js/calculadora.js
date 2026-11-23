'use strict';

(() => {
  const el = id => document.getElementById(id);
  const veiculo = el('veiculo');
  const tipos = ['combustao', 'eletrico', 'carro_combustao', 'carro_eletrico', 'ebike', 'bike'];
  const modos = ['proprio', 'alugado'];
  const combustiveis = ['gasolina', 'etanol'];
  const fontesEnergia = [...combustiveis, 'eletrica'];
  const opcoesPeriodos = {
    periodoSeguro: ['mensal', 'anual'],
    periodoIpva: ['anual', 'mensal'],
    periodoAluguel: ['semana', 'dia', 'mes']
  };
  const padrao = {
    diasSemana: '', diasMes: '', financiamento: '', seguro: '', periodoSeguro: 'mensal',
    ipva: '', periodoIpva: 'anual', manutMensal: '', depreciacao: '', aluguel: '',
    periodoAluguel: 'semana'
  };
  const camposFixos = Object.keys(padrao);
  const camposEnergia = ['preco', 'consumo'];
  const chave = 'lucroNaRotaConfiguracoesV2';
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const ehCombustao = tipo => tipo === 'combustao' || tipo === 'carro_combustao';
  const ehEletrico = tipo => tipo === 'eletrico' || tipo === 'ebike' || tipo === 'carro_eletrico';
  const idsResultados = [
    'custoComb', 'custoManut', 'custoModalidade', 'custoExtras', 'custoExtraManut', 'custos',
    'custoVariavelKm', 'custoTotalKm', 'porKm', 'porHora', 'semDep'
  ];

  function novosPerfis() {
    return Object.fromEntries(modos.map(modo => [
      modo,
      Object.fromEntries(tipos.map(tipo => [
        tipo,
        {
          ...padrao,
          combustivel: 'gasolina',
          energia: Object.fromEntries(fontesEnergia.map(fonte => [fonte, { preco: '', consumo: '' }]))
        }
      ]))
    ]));
  }

  let perfis = novosPerfis();
  let modoAtual = 'proprio';
  let tipoAtual = veiculo.value;
  let combustivelAtivo = 'gasolina';
  let resumo = '';

  const ativo = () => perfis[modoAtual][tipoAtual];
  const chaveEnergia = () => ehCombustao(tipoAtual) ? combustivelAtivo : 'eletrica';

  function lerDecimal(texto, opcional = false) {
    const valor = texto.trim();
    if (valor === '') return opcional ? 0 : NaN;
    const normalizado = valor.replace(',', '.');
    if (!/^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(normalizado)) return NaN;
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : NaN;
  }

  function guardarValor(destino, campo, valor) {
    if (typeof valor !== 'string') return;
    const opcoes = opcoesPeriodos[campo];
    if (opcoes ? opcoes.includes(valor) : Number.isFinite(lerDecimal(valor, true))) {
      destino[campo] = valor;
    }
  }

  function carregarDados() {
    let raw;
    try {
      raw = localStorage.getItem(chave);
    } catch {
      el('statusSalvamento').textContent = 'O navegador bloqueou o salvamento. Os dados ficam disponíveis somente nesta página.';
      return;
    }
    if (!raw) return;

    let salvo;
    try {
      salvo = JSON.parse(raw);
    } catch {
      el('statusSalvamento').textContent = 'Não foi possível ler as configurações salvas. Você pode apagá-las e começar de novo.';
      return;
    }
    if (salvo?.versao !== 2 || !salvo.perfis) return;

    for (const modo of modos) {
      for (const tipo of tipos) {
        const fonte = salvo.perfis[modo]?.[tipo];
        if (!fonte || typeof fonte !== 'object') continue;
        const destino = perfis[modo][tipo];
        for (const campo of camposFixos) guardarValor(destino, campo, fonte[campo]);
        if (combustiveis.includes(fonte.combustivel)) destino.combustivel = fonte.combustivel;
        for (const energia of fontesEnergia) {
          for (const campo of camposEnergia) {
            guardarValor(destino.energia[energia], campo, fonte.energia?.[energia]?.[campo]);
          }
        }
      }
    }
    if (modos.includes(salvo.ultimoModo)) modoAtual = salvo.ultimoModo;
    if (tipos.includes(salvo.ultimoTipo)) tipoAtual = salvo.ultimoTipo;
    el('statusSalvamento').textContent = 'Configurações fixas carregadas deste navegador. Os números do dia ficam nesta página.';
  }

  function salvarDados() {
    try {
      const dados = { versao: 2, ultimoModo: modoAtual, ultimoTipo: tipoAtual, perfis };
      localStorage.setItem(chave, JSON.stringify(dados));
      el('statusSalvamento').textContent = 'Configurações fixas salvas neste navegador. Faturamento, km, horas, consertos e outros gastos do dia ficam nesta página.';
    } catch {
      el('statusSalvamento').textContent = 'O navegador bloqueou o salvamento. Os dados ficam disponíveis somente nesta página.';
    }
  }

  function guardarPerfil() {
    const perfil = ativo();
    for (const id of camposFixos) guardarValor(perfil, id, el(id).value);
    for (const id of camposEnergia) guardarValor(perfil.energia[chaveEnergia()], id, el(id).value);
    perfil.combustivel = combustivelAtivo;
  }

  function carregarPerfil() {
    const perfil = ativo();
    for (const id of camposFixos) el(id).value = perfil[id];
    combustivelAtivo = perfil.combustivel;
    el('combustivel').value = combustivelAtivo;
    for (const id of camposEnergia) el(id).value = perfil.energia[chaveEnergia()][id];
  }

  function ajustar() {
    const tipo = tipoAtual;
    const bike = tipo === 'bike';
    const proprio = modoAtual === 'proprio';
    const periodo = el('periodoAluguel').value;
    el('painelProprio').hidden = !proprio;
    el('painelAlugado').hidden = proprio;
    el('abaProprio').setAttribute('aria-pressed', String(proprio));
    el('abaAlugado').setAttribute('aria-pressed', String(!proprio));
    el('campoDiasSemana').hidden = proprio || periodo !== 'semana';
    el('campoDiasMes').hidden = !proprio && periodo !== 'mes';
    el('campoCombustivel').hidden = !ehCombustao(tipo);
    el('exemploMoto').hidden = !proprio || tipo !== 'combustao';
    document.querySelectorAll('.energia').forEach(campo => { campo.hidden = bike; });
    document.querySelector('label[for=preco]').textContent = ehCombustao(tipo)
      ? 'Preço do combustível (R$/litro)'
      : 'Preço da energia (R$/kWh)';
    document.querySelector('label[for=consumo]').textContent = ehCombustao(tipo)
      ? 'Consumo (km/litro)'
      : 'Eficiência elétrica (km/kWh)';
    el('ajudaPreco').textContent = ehCombustao(tipo)
      ? 'Quanto custa 1 litro do combustível selecionado?'
      : 'Informe o preço de 1 kWh da conta de luz.';
    el('ajudaConsumo').textContent = ehCombustao(tipo)
      ? 'Quantos km seu veículo faz com 1 litro desse combustível?'
      : 'Quantos km percorre com 1 kWh? Consulte os dados de autonomia e bateria.';
    document.querySelector('label[for=aluguel]').textContent = tipo.startsWith('carro_')
      ? 'Valor do aluguel do carro (R$)'
      : 'Valor do aluguel do veículo (R$)';
    el('linhaManut').hidden = !proprio;
    el('linhaSemDep').hidden = !proprio;
    el('linhaExtraManut').hidden = !proprio;
    calcular();
  }

  function selecionarModo(modo) {
    if (modo === modoAtual) return;
    guardarPerfil();
    modoAtual = modo;
    carregarPerfil();
    salvarDados();
    ajustar();
  }

  function trocarVeiculo() {
    guardarPerfil();
    tipoAtual = veiculo.value;
    carregarPerfil();
    salvarDados();
    ajustar();
  }

  function trocarCombustivel() {
    guardarPerfil();
    combustivelAtivo = el('combustivel').value;
    ativo().combustivel = combustivelAtivo;
    const dados = ativo().energia[chaveEnergia()];
    for (const id of camposEnergia) el(id).value = dados[id];
    salvarDados();
    calcular();
  }

  function limparPerfis() {
    perfis = novosPerfis();
    modoAtual = 'proprio';
    tipoAtual = 'combustao';
    veiculo.value = tipoAtual;
    carregarPerfil();
    ajustar();
  }

  function apagarConfiguracoes() {
    if (!window.confirm('Apagar as configurações de todos os veículos neste navegador? Os números do dia vão continuar na página.')) return;
    limparPerfis();
    try {
      localStorage.removeItem(chave);
      el('statusSalvamento').textContent = 'Configurações salvas apagadas deste navegador.';
    } catch {
      el('statusSalvamento').textContent = 'As configurações da página foram limpas. O navegador impediu a exclusão no armazenamento local.';
    }
  }

  function numero(id, opcional = false) {
    return lerDecimal(el(id).value, opcional);
  }

  function limparCopia() {
    el('statusCopia').textContent = '';
    el('resumoManual').hidden = true;
    el('resumoManual').value = '';
  }

  function invalidar(mensagem) {
    el('erro').hidden = false;
    if (el('erro').textContent !== mensagem) el('erro').textContent = mensagem;
    el('lucro').textContent = '—';
    el('lucro').classList.remove('is-negative');
    for (const id of idsResultados) el(id).textContent = '—';
    el('copiar').disabled = true;
    limparCopia();
    resumo = '';
  }

  function calcular() {
    const tipo = tipoAtual;
    const bike = tipo === 'bike';
    const proprio = modoAtual === 'proprio';
    const periodo = el('periodoAluguel').value;
    const usaDiasSemana = !proprio && periodo === 'semana';
    const usaDiasMes = proprio || periodo === 'mes';

    const d = {
      receita: numero('receita'),
      km: numero('km'),
      horas: numero('horas'),
      preco: bike ? 0 : numero('preco', true),
      consumo: bike ? 0 : numero('consumo', true),
      depreciacao: proprio ? numero('depreciacao', true) : 0,
      financiamento: proprio ? numero('financiamento', true) : 0,
      seguro: proprio ? numero('seguro', true) : 0,
      ipva: proprio ? numero('ipva', true) : 0,
      manutMensal: proprio ? numero('manutMensal', true) : 0,
      consertoExtra: proprio ? numero('consertoExtra', true) : 0,
      aluguel: proprio ? 0 : numero('aluguel', true),
      extras: numero('gastosDia', true),
      diasSemana: usaDiasSemana ? numero('diasSemana', true) : 0,
      diasMes: usaDiasMes ? numero('diasMes', true) : 0
    };

    if (Object.values(d).some(valor => !Number.isFinite(valor))) {
      invalidar('Preencha faturamento, quilômetros e horas. Use números a partir de zero e vírgula ou ponto para decimais.');
      return;
    }
    if (!Number.isInteger(d.diasSemana) || d.diasSemana > 7 || !Number.isInteger(d.diasMes) || d.diasMes > 31) {
      invalidar('Use uma quantidade válida de dias: até 7 por semana ou até 31 por mês.');
      return;
    }
    if (!bike && d.km > 0 && (d.consumo <= 0 || el('preco').value.trim() === '')) {
      invalidar('Informe o preço por litro ou kWh, mesmo que seja zero, e um consumo maior que zero.');
      return;
    }

    const seguroMes = d.seguro / (el('periodoSeguro').value === 'anual' ? 12 : 1);
    const ipvaMes = d.ipva / (el('periodoIpva').value === 'anual' ? 12 : 1);
    const fixosMes = d.financiamento + seguroMes + ipvaMes + d.manutMensal;
    if (proprio && fixosMes > 0 && d.diasMes === 0) {
      invalidar('Informe os dias trabalhados por mês para ratear as despesas mensais.');
      return;
    }
    if (usaDiasSemana && d.aluguel > 0 && d.diasSemana === 0) {
      invalidar('Informe os dias trabalhados por semana para ratear o aluguel semanal.');
      return;
    }
    if (!proprio && usaDiasMes && d.aluguel > 0 && d.diasMes === 0) {
      invalidar('Informe os dias trabalhados por mês para ratear o aluguel mensal.');
      return;
    }

    const energia = bike || d.km === 0 ? 0 : d.km / d.consumo * d.preco;
    const depreciacao = proprio ? d.km * d.depreciacao : 0;
    const divisorAluguel = usaDiasSemana ? d.diasSemana : (usaDiasMes ? d.diasMes : 1);
    const custoModalidade = proprio
      ? (fixosMes ? fixosMes / d.diasMes : 0)
      : (d.aluguel ? d.aluguel / divisorAluguel : 0);
    const consertoExtra = proprio ? d.consertoExtra : 0;
    const custos = energia + depreciacao + custoModalidade + consertoExtra + d.extras;
    const lucro = d.receita - custos;
    const semDep = lucro + depreciacao;
    const porKm = d.km ? lucro / d.km : null;
    const porHora = d.horas ? lucro / d.horas : null;
    const variavelKm = d.km ? (energia + depreciacao) / d.km : null;
    const totalKm = d.km ? custos / d.km : null;

    const valores = {
      custoComb: energia, custoManut: depreciacao, custoModalidade,
      custoExtras: d.extras, custoExtraManut: consertoExtra, custos, semDep,
      custoVariavelKm: variavelKm, custoTotalKm: totalKm, porKm, porHora
    };
    if (!Number.isFinite(lucro) || Object.values(valores).some(valor => valor !== null && !Number.isFinite(valor))) {
      invalidar('Os valores informados ultrapassam o limite de cálculo. Confira os números digitados.');
      return;
    }

    el('erro').hidden = true;
    el('copiar').disabled = false;
    el('nomeEnergia').textContent = bike ? 'Combustível / energia' : ehEletrico(tipo) ? 'Energia elétrica' : 'Combustível';
    el('nomeModalidade').textContent = proprio ? 'Manutenção e despesas mensais (rateadas)' : 'Aluguel do veículo (rateado)';
    el('notaRateio').textContent = proprio
      ? 'Seguro e IPVA anuais são divididos por 12. As despesas mensais são rateadas pelos dias trabalhados. Consertos extraordinários entram integralmente no dia.'
      : 'O aluguel é dividido pelos dias trabalhados conforme o período escolhido. Outras despesas informadas são por dia.';
    el('notaFinal').textContent = proprio
      ? 'A prestação é uma saída de dinheiro. A depreciação estima a perda de valor do veículo. Use o resultado para planejar. O lucro contábil e o saldo de caixa seguem critérios próprios.'
      : 'Estimativa após combustível, aluguel e outras despesas informadas.';
    el('lucro').textContent = brl(lucro);
    el('lucro').classList.toggle('is-negative', lucro < 0);
    const resultados = {};
    for (const [id, valor] of Object.entries(valores)) {
      resultados[id] = valor === null ? 'Não calculável' : brl(valor);
      el(id).textContent = resultados[id];
    }

    resumo = [
      'Lucro na Rota — Fechamento do dia',
      'Veículo: ' + veiculo.options[veiculo.selectedIndex].text + ' (' + (proprio ? 'próprio' : 'alugado') + ')',
      ehCombustao(tipo) ? 'Combustível: ' + combustivelAtivo : null,
      'Faturamento: ' + brl(d.receita),
      'Quilômetros: ' + d.km + ' km',
      'Horas: ' + d.horas + ' h',
      'Combustível / energia: ' + brl(energia),
      proprio ? 'Manutenção e despesas mensais rateadas: ' + brl(custoModalidade) : 'Aluguel rateado: ' + brl(custoModalidade),
      proprio ? 'Depreciação: ' + brl(depreciacao) : null,
      proprio ? 'Conserto extraordinário: ' + brl(consertoExtra) : null,
      !proprio || d.extras > 0 ? 'Outros gastos do dia: ' + brl(d.extras) : null,
      'Custo total: ' + brl(custos),
      'Custo médio por km: ' + resultados.custoTotalKm,
      'Resultado estimado do dia: ' + brl(lucro),
      'Resultado por km: ' + resultados.porKm,
      'Resultado por hora: ' + resultados.porHora,
      proprio ? 'Resultado antes da depreciação: ' + brl(semDep) : null,
      'Valores mensais/anuais rateados; estimativa, não lucro contábil.'
    ].filter(Boolean).join('\n');
    limparCopia();
  }

  function mudouFixo() {
    guardarPerfil();
    salvarDados();
    ajustar();
  }

  for (const id of camposFixos) {
    el(id).addEventListener(opcoesPeriodos[id] ? 'change' : 'input', mudouFixo);
  }
  for (const id of camposEnergia) {
    el(id).addEventListener('input', () => {
      guardarPerfil();
      salvarDados();
      calcular();
    });
  }
  for (const id of ['receita', 'km', 'horas', 'consertoExtra', 'gastosDia']) {
    el(id).addEventListener('input', calcular);
  }
  el('combustivel').addEventListener('change', trocarCombustivel);
  veiculo.addEventListener('change', trocarVeiculo);
  el('abaProprio').addEventListener('click', () => selecionarModo('proprio'));
  el('abaAlugado').addEventListener('click', () => selecionarModo('alugado'));
  el('apagarConfiguracoes').addEventListener('click', apagarConfiguracoes);
  window.addEventListener('storage', evento => {
    if ((evento.key === chave || evento.key === null) && evento.newValue === null && evento.storageArea === localStorage) {
      limparPerfis();
      el('statusSalvamento').textContent = 'As configurações salvas foram apagadas em outra aba.';
    }
  });

  el('usarExemplo').addEventListener('click', () => {
    if (modoAtual !== 'proprio' || tipoAtual !== 'combustao') return;
    if (el('manutMensal').value.trim() === '') el('manutMensal').value = '120';
    if (el('depreciacao').value.trim() === '') el('depreciacao').value = '0,10';
    guardarPerfil();
    salvarDados();
    calcular();
  });

  el('copiar').addEventListener('click', async () => {
    const texto = resumo;
    if (!texto) return;
    let copiado = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        copiado = true;
      }
    } catch {
      // Oferece seleção manual se a permissão da área de transferência falhar.
    }
    if (resumo !== texto) return;
    if (!copiado) {
      const area = el('resumoManual');
      area.hidden = false;
      area.value = texto;
      area.focus();
      area.select();
      try {
        copiado = document.execCommand('copy');
      } catch {
        copiado = false;
      }
      if (copiado) {
        area.hidden = true;
        el('copiar').focus();
      }
    }
    el('statusCopia').textContent = copiado ? 'Resumo copiado!' : 'Selecione e copie o texto abaixo manualmente.';
  });

  carregarDados();
  veiculo.value = tipoAtual;
  carregarPerfil();
  ajustar();
})();
