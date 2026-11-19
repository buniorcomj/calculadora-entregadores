import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const raiz = new URL('../', import.meta.url);
const chave = 'lucroNaRotaConfiguracoesV2';
const referencia = 'ae399a99e66843337adc3198b0cbbf4d053c522d';

const matriz = [
  ['Moto própria, gasolina, seguro anual, IPVA mensal e conserto', {
    receita: '220', km: '120', horas: '8', preco: '6', consumo: '40',
    depreciacao: '0,10', financiamento: '240', seguro: '1440', periodoSeguro: 'anual',
    ipva: '48', periodoIpva: 'mensal', manutMensal: '120', diasMes: '24', consertoExtra: '25',
  }, {
    custoComb: 18, custoManut: 12, custoModalidade: 22, custoExtraManut: 25,
    custos: 77, lucro: 143, semDep: 155, porKm: 143 / 120, porHora: 143 / 8,
    custoVariavelKm: 0.25, custoTotalKm: 77 / 120,
  }],
  ['Carro próprio, etanol, seguro mensal e IPVA anual', {
    veiculo: 'carro_combustao', combustivel: 'etanol', receita: '200', km: '80', horas: '8',
    preco: '4', consumo: '8', seguro: '120', ipva: '720', diasMes: '20', depreciacao: '0,20',
  }, { custoComb: 40, custoManut: 16, custoModalidade: 9, custos: 65, lucro: 135 }],
  ['Moto elétrica', {
    veiculo: 'eletrico', receita: '100', km: '75', horas: '5', preco: '1.2', consumo: '15',
  }, { custoComb: 6, lucro: 94, porHora: 18.8 }],
  ['Carro elétrico', {
    veiculo: 'carro_eletrico', receita: '50', km: '20', horas: '2', preco: '1.2', consumo: '4',
  }, { custoComb: 6, lucro: 44, custoVariavelKm: 0.3 }],
  ['Bicicleta elétrica', {
    veiculo: 'ebike', receita: '75', km: '60', horas: '5', preco: '1.2', consumo: '30',
  }, { custoComb: 2.4, lucro: 72.6, custoVariavelKm: 0.04 }],
  ['Bicicleta comum sem combustível', {
    veiculo: 'bike', receita: '40', km: '30', horas: '2',
  }, { custoComb: 0, lucro: 40, porHora: 20 }],
  ['Moto alugada por semana com prejuízo', {
    modo: 'alugado', receita: '100', km: '130', horas: '8', preco: '6', consumo: '26',
    aluguel: '360', diasSemana: '6', extrasAlugado: '12',
  }, {
    custoComb: 30, custoModalidade: 60, custoExtras: 12, custos: 102,
    lucro: -2, porHora: -0.25, custoTotalKm: 102 / 130, custoVariavelKm: 30 / 130,
  }],
  ['Carro alugado por mês', {
    modo: 'alugado', veiculo: 'carro_combustao', receita: '200', km: '80', horas: '8',
    preco: '6', consumo: '8', aluguel: '1200', periodoAluguel: 'mes', diasMes: '24',
  }, { custoComb: 60, custoModalidade: 50, lucro: 90 }],
  ['Bicicleta alugada por dia', {
    modo: 'alugado', veiculo: 'bike', receita: '40', km: '30', horas: '2',
    aluguel: '15,50', periodoAluguel: 'dia', extrasAlugado: '2,50',
  }, { custoComb: 0, custoModalidade: 15.5, custoExtras: 2.5, lucro: 22 }],
  ['Distância e horas zero', {
    receita: '0', km: '0', horas: '0',
  }, { lucro: 0, custoTotalKm: 'Não calculável', porKm: 'Não calculável', porHora: 'Não calculável' }],
  ['Combustível fornecido sem cobrança', {
    receita: '100', km: '40', horas: '4', preco: '0', consumo: '40',
  }, { custoComb: 0, lucro: 100 }],
];

function lerOriginal() {
  const html = execFileSync('git', ['show', `${referencia}:index.html`], { cwd: raiz, encoding: 'utf8' });
  const script = html.match(/<script>([\s\S]+)<\/script>/)?.[1];
  assert.ok(script, 'script embutido da calculadora original');
  return { html, script };
}

function lerIntegrada() {
  return {
    html: readFileSync(new URL('calculadora/index.html', raiz), 'utf8'),
    script: readFileSync(new URL('assets/js/calculadora.js', raiz), 'utf8'),
  };
}

function carregar(versao, { dados = new Map(), copiar = true, confirma = true, armazenamentoBloqueado = false } = {}) {
  const elementos = new Map();
  const energia = [];
  const copia = [];
  const seletores = new Set(['veiculo', 'combustivel', 'periodoAluguel', 'periodoSeguro', 'periodoIpva']);

  function elemento(valor = '', hidden = false) {
    const eventos = new Map();
    const atributos = new Map();
    const classes = new Set();
    return {
      value: valor, hidden, textContent: '', disabled: false, options: [], style: {}, dataset: {},
      classList: {
        add: classe => classes.add(classe),
        remove: classe => classes.delete(classe),
        toggle(classe, forcar = !classes.has(classe)) {
          if (forcar) classes.add(classe);
          else classes.delete(classe);
          return forcar;
        },
        contains: classe => classes.has(classe),
      },
      get selectedIndex() { return this.options.findIndex(opcao => opcao.value === this.value); },
      addEventListener: (tipo, acao) => eventos.set(tipo, acao),
      disparar: tipo => eventos.get(tipo)?.(),
      setAttribute: (nome, valorAtributo) => atributos.set(nome, valorAtributo),
      getAttribute: nome => atributos.get(nome),
      removeAttribute: nome => atributos.delete(nome),
      focus() {},
      select() {},
    };
  }

  for (const [tag] of versao.html.matchAll(/<[a-z][^>]*>/gi)) {
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const hidden = /\shidden(?:\s|>)/.test(tag);
    if (id) {
      assert.ok(!elementos.has(id), `ID duplicado: ${id}`);
      elementos.set(id, elemento(tag.match(/\bvalue="([^"]*)"/)?.[1], hidden));
    }
    const classes = tag.match(/\bclass="([^"]+)"/)?.[1].split(/\s+/) ?? [];
    if (classes.includes('energia')) energia.push(elemento('', hidden));
  }
  for (const [, id, opcoes] of versao.html.matchAll(/<select[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)) {
    const select = elementos.get(id);
    select.options = Array.from(opcoes.matchAll(/<option\b[^>]*\bvalue="([^"]+)"[^>]*>([^<]+)<\/option>/gi),
      ([, value, text]) => ({ value, text: text.trim() }));
    select.value = select.options[0].value;
  }

  const labels = new Map(Array.from(versao.html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g),
    ([, id]) => [`label[for=${id}]`, elemento()]));
  const obter = id => {
    assert.ok(elementos.has(id), `Elemento ausente no HTML: ${id}`);
    return elementos.get(id);
  };
  const document = {
    getElementById: obter,
    querySelector: seletor => labels.get(seletor) ?? (seletor.startsWith('#') ? obter(seletor.slice(1)) : null),
    querySelectorAll: seletor => seletor === '.energia' ? energia : [],
    execCommand: () => false,
  };
  const localStorage = {
    getItem: id => lerArmazenamento(() => dados.get(id) ?? null),
    setItem: (id, valor) => lerArmazenamento(() => dados.set(id, valor)),
    removeItem: id => lerArmazenamento(() => dados.delete(id)),
  };
  function lerArmazenamento(acao) {
    if (armazenamentoBloqueado) throw new Error('Armazenamento bloqueado');
    return acao();
  }
  const eventosJanela = new Map();
  const janela = {
    confirm: () => confirma,
    addEventListener: (tipo, acao) => eventosJanela.set(tipo, acao),
  };
  runInNewContext(versao.script, {
    document, localStorage, window: janela, confirm: janela.confirm,
    navigator: { clipboard: copiar ? { writeText: async texto => copia.push(texto) } : undefined },
  }, { filename: 'calculadora.js' });

  function preencher(campos) {
    for (const [id, valor] of Object.entries(campos)) {
      if (id === 'modo') {
        obter(valor === 'alugado' ? 'abaAlugado' : 'abaProprio').disparar('click');
      } else {
        const entrada = obter(id);
        entrada.value = valor;
        entrada.disparar(seletores.has(id) ? 'change' : 'input');
      }
    }
  }
  function avisarExclusaoEmOutraAba() {
    eventosJanela.get('storage')?.({ key: chave, newValue: null, storageArea: localStorage });
  }
  return { obter, preencher, dados, copia, energia, avisarExclusaoEmOutraAba };
}

function verificarValores(calc, esperados) {
  assert.equal(calc.obter('erro').hidden, true);
  assert.equal(calc.obter('copiar').disabled, false);
  for (const [id, valor] of Object.entries(esperados)) {
    const formatado = typeof valor === 'number'
      ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : valor;
    assert.equal(calc.obter(id).textContent, formatado, id);
  }
}

const dadosBasicos = { receita: '100', km: '80', horas: '8', preco: '4', consumo: '40' };
const entradasInvalidas = [
  ['simulação ainda vazia', {}],
  ['valor negativo', { ...dadosBasicos, receita: '-1' }],
  ['texto em campo de moeda', { ...dadosBasicos, manutMensal: '<img src=x>' }],
  ['consumo zero com distância positiva', { ...dadosBasicos, consumo: '0' }],
  ['preço omitido com distância positiva', { ...dadosBasicos, preco: '' }],
  ['dias do mês faltantes com custo mensal', { ...dadosBasicos, manutMensal: '120' }],
  ['mais de 31 dias do mês', { ...dadosBasicos, diasMes: '32' }],
  ['dias da semana faltantes com aluguel semanal', { modo: 'alugado', ...dadosBasicos, aluguel: '120' }],
  ['mais de 7 dias na semana', { modo: 'alugado', ...dadosBasicos, diasSemana: '8' }],
  ['dias do mês faltantes com aluguel mensal', {
    modo: 'alugado', ...dadosBasicos, aluguel: '120', periodoAluguel: 'mes',
  }],
];

function testarVersao(nome, versao) {
  test(nome, async contexto => {
    for (const [caso, campos, esperados] of matriz) {
      await contexto.test(caso, () => {
        const calc = carregar(versao);
        calc.preencher(campos);
        verificarValores(calc, esperados);
        if (campos.veiculo === 'bike') assert.ok(calc.energia.every(campo => campo.hidden));
      });
    }

    for (const [caso, campos] of entradasInvalidas) {
      await contexto.test(`Validação: ${caso}`, () => {
        const calc = carregar(versao);
        calc.preencher(campos);
        assert.equal(calc.obter('erro').hidden, false);
        assert.equal(calc.obter('lucro').textContent, '—');
        assert.equal(calc.obter('copiar').disabled, true);
      });
    }

    await contexto.test('Exemplo preserva entrada existente', () => {
      const calc = carregar(versao);
      calc.preencher({ diasMes: '24', manutMensal: '180' });
      calc.obter('usarExemplo').disparar('click');
      assert.equal(calc.obter('manutMensal').value, '180');
      assert.equal(calc.obter('depreciacao').value, '0,10');
    });

    await contexto.test('Persistência por modalidade, veículo e combustível', () => {
      const calc = carregar(versao);
      calc.preencher({ ...dadosBasicos, consertoExtra: '91,37', diasMes: '22' });
      calc.preencher({ combustivel: 'etanol', preco: '3.5', consumo: '30' });
      calc.preencher({ modo: 'alugado', diasSemana: '6', aluguel: '300' });
      assert.equal(calc.obter('painelProprio').hidden, true);
      assert.equal(calc.obter('painelAlugado').hidden, false);
      assert.equal(calc.obter('abaAlugado').getAttribute('aria-pressed'), 'true');
      assert.equal(calc.obter('campoDiasSemana').hidden, false);
      calc.preencher({ veiculo: 'eletrico', preco: '1.2', consumo: '12' });
      calc.preencher({ modo: 'proprio', veiculo: 'combustao' });

      for (const [id, valor] of Object.entries({
        receita: '100', km: '80', horas: '8', diasMes: '22',
        combustivel: 'etanol', preco: '3.5', consumo: '30',
      })) assert.equal(calc.obter(id).value, valor, id);

      calc.preencher({ combustivel: 'gasolina' });
      assert.equal(calc.obter('preco').value, '4');
      assert.equal(calc.obter('consumo').value, '40');
      const restaurada = carregar(versao, { dados: calc.dados });
      assert.equal(restaurada.obter('preco').value, '4');
      assert.equal(restaurada.obter('consumo').value, '40');
      restaurada.preencher({ modo: 'alugado' });
      assert.equal(restaurada.obter('aluguel').value, '300');
      assert.equal(restaurada.obter('diasSemana').value, '6');

      for (const id of ['receita', 'km', 'horas', 'consertoExtra']) {
        assert.equal(restaurada.obter(id).value, '', id);
        assert.ok(!calc.dados.get(chave).includes(`"${id}":`), id);
      }
    });

    await contexto.test('Resumo para área de transferência e alternativa manual', async () => {
      const calc = carregar(versao);
      calc.preencher(dadosBasicos);
      await calc.obter('copiar').disparar('click');
      assert.equal(calc.copia.length, 1);
      assert.match(calc.copia[0], /Resultado estimado do dia: R\$\s92,00/);
      assert.match(calc.copia[0], /Combustível: gasolina/);
      assert.equal(calc.obter('resumoManual').hidden, true);

      const manual = carregar(versao, { copiar: false });
      manual.preencher(dadosBasicos);
      await manual.obter('copiar').disparar('click');
      assert.equal(manual.obter('resumoManual').value, calc.copia[0]);
      assert.equal(manual.obter('resumoManual').hidden, false);
    });
  });
}

const somenteOriginal = process.argv.includes('--original');
const original = lerOriginal();
testarVersao('Linha de base em main', original);

if (!somenteOriginal) {
  const integrada = lerIntegrada();
  testarVersao('Calculadora integrada', integrada);

  test('Igualdade das saídas e do resumo com main', async contexto => {
    const ids = Object.keys(Object.assign({}, ...matriz.map(([, , resultados]) => resultados)));
    for (const [caso, campos] of matriz) {
      await contexto.test(caso, async () => {
        const antes = carregar(original);
        const depois = carregar(integrada);
        for (const calc of [antes, depois]) {
          calc.preencher(campos);
          await calc.obter('copiar').disparar('click');
        }
        for (const id of ids) assert.equal(depois.obter(id).textContent, antes.obter(id).textContent, id);
        assert.equal(depois.copia[0], antes.copia[0]);
      });
    }
  });

  test('Restaurar, cancelar exclusão e apagar configurações antigas', () => {
    const antes = carregar(original);
    antes.preencher({ modo: 'alugado', veiculo: 'carro_combustao', combustivel: 'etanol',
      preco: '4.2', consumo: '12', diasSemana: '5', aluguel: '400',
    });
    antes.dados.set('outroProjeto', 'manter');
    const cancelar = carregar(integrada, { dados: antes.dados, confirma: false });
    cancelar.obter('apagarConfiguracoes').disparar('click');
    assert.equal(cancelar.obter('aluguel').value, '400');
    assert.equal(cancelar.obter('veiculo').value, 'carro_combustao');
    assert.equal(cancelar.obter('combustivel').value, 'etanol');

    const depois = carregar(integrada, { dados: antes.dados });
    assert.equal(depois.obter('preco').value, '4.2');
    assert.equal(depois.obter('diasSemana').value, '5');
    depois.preencher({ receita: '100', km: '80', horas: '8' });
    depois.obter('apagarConfiguracoes').disparar('click');
    assert.equal(depois.dados.has(chave), false);
    assert.equal(depois.dados.get('outroProjeto'), 'manter');
    assert.equal(depois.obter('preco').value, '');
    assert.equal(depois.obter('aluguel').value, '');
    assert.equal(depois.obter('receita').value, '100');
    assert.equal(carregar(integrada, { dados: depois.dados }).obter('preco').value, '');
  });

  test('Continua calculando quando o armazenamento é bloqueado', () => {
    const calc = carregar(integrada, { armazenamentoBloqueado: true });
    calc.preencher(dadosBasicos);
    verificarValores(calc, { lucro: 92 });
    assert.equal(calc.dados.size, 0);
  });

  test('Aceita vírgula nos campos dos números do dia e de energia', () => {
    const calc = carregar(integrada);
    calc.preencher({ receita: '100,95', km: '20,5', horas: '2,5', preco: '6,50', consumo: '20,5' });
    verificarValores(calc, { custoComb: 6.5, lucro: 94.45, porHora: 37.78 });
  });

  test('Bloqueia resultados fora da faixa numérica', () => {
    const calc = carregar(integrada);
    calc.preencher({ receita: '200', km: '2', horas: '4', preco: '1' + '0'.repeat(308), consumo: '1' });
    assert.equal(calc.obter('erro').hidden, false);
    assert.match(calc.obter('erro').textContent, /limite de cálculo/);
    assert.equal(calc.obter('lucro').textContent, '—');
    assert.equal(calc.obter('copiar').disabled, true);
  });

  test('Ignora dias do período oculto ao alternar o aluguel', () => {
    const calc = carregar(integrada);
    calc.preencher({ modo: 'alugado', ...dadosBasicos, aluguel: '24', diasSemana: 'inválido' });
    assert.equal(calc.obter('erro').hidden, false);
    calc.preencher({ periodoAluguel: 'dia' });
    assert.equal(calc.obter('campoDiasSemana').hidden, true);
    verificarValores(calc, { lucro: 68, custoModalidade: 24 });
    calc.preencher({ periodoAluguel: 'semana' });
    assert.equal(calc.obter('erro').hidden, false);
  });

  test('Lida com perfis antigos adulterados sem aceitar texto inválido', () => {
    const dados = new Map([[chave, JSON.stringify({
      versao: 2,
      perfis: { proprio: { combustao: { seguro: '<img src=x>', periodoSeguro: 'teste', manutMensal: '120' } } },
    })]]);
    const calc = carregar(integrada, { dados });
    assert.equal(calc.obter('seguro').value, '');
    assert.equal(calc.obter('periodoSeguro').value, 'mensal');
    assert.equal(calc.obter('manutMensal').value, '120');
    calc.preencher({ ...dadosBasicos, diasMes: '24' });
    verificarValores(calc, { lucro: 87 });
  });

  test('A exclusão de configurações se reflete em outras abas', () => {
    const primeira = carregar(integrada);
    primeira.preencher(dadosBasicos);
    const outraAba = carregar(integrada, { dados: primeira.dados });
    outraAba.preencher({ receita: '99' });
    assert.equal(outraAba.obter('preco').value, '4');
    primeira.obter('apagarConfiguracoes').disparar('click');
    outraAba.avisarExclusaoEmOutraAba();
    assert.equal(outraAba.obter('preco').value, '');
    assert.equal(outraAba.obter('receita').value, '99');
    assert.equal(primeira.dados.has(chave), false);
  });
}
