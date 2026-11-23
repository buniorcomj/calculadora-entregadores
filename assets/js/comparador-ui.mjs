import { aplicativo, empregado, equivalencia, jornada, porHora, regraJornada } from './comparador.mjs';
import { regras } from './regras-clt.mjs';

const el = id => document.getElementById(id);
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const dinheiro = valor => valor === null ? 'Não calculável' : moeda.format(valor);
const horas = valor => decimal.format(valor) + ' h';
const erro = el('erro-comparador');
const destino = el('resultados');

function numero(id) {
  const campo = el(id);
  const texto = campo.value.trim();
  if (!texto && campo.hasAttribute('data-opcional')) return undefined;
  const inteiro = campo.inputMode === 'numeric';
  const formato = inteiro ? /^\d+$/ : /^(?:\d+(?:[,.]\d{1,2})?|[,.]\d{1,2})$/;
  const valor = Number(texto.replace(',', '.'));
  if (!formato.test(texto) || valor < Number(campo.dataset.min) || valor > Number(campo.dataset.max)) {
    throw new Error('Confira o campo “' + campo.labels[0].textContent + '”. Use um número no intervalo indicado pelo campo.');
  }
  return valor;
}
const valores = ids => Object.fromEntries(ids.split(' ').map(id => [id, numero(id)]));
const turno = (prefixo, espera = 0) => jornada(el(prefixo + 'Inicio').value, el(prefixo + 'Fim').value,
  numero(prefixo + 'Almoco'), numero(prefixo + 'Pausas'), espera);

function bloco(titulo, linhas) {
  const secao = document.createElement('section');
  secao.className = 'calc-costs';
  const h = document.createElement('h3');
  h.textContent = titulo;
  const dl = document.createElement('dl');
  dl.className = 'calc-breakdown';
  for (const [nome, valor] of linhas) {
    const linha = document.createElement('div');
    linha.className = 'calc-row';
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = nome;
    dd.textContent = valor;
    linha.append(dt, dd);
    dl.append(linha);
  }
  secao.append(h, dl);
  return secao;
}

function calcular(moverFoco = false) {
  destino.replaceChildren();
  erro.hidden = true;
  try {
    const data = el('data').value;
    if (!data || !data.startsWith(regras.competencia + '-') || !el('data').validity.valid) {
      throw new Error('Escolha uma data de referência em ' + regras.competencia + '.');
    }
    const [, teto, repousos] = regraJornada(data);
    const contrato = numero('contrato');
    const a = aplicativo({
      ...valores('receita custo bonus previdencia seguro tributos reserva'),
      diasSemana: numero('appSemana'), diasMes: numero('appMes'),
      ferias: numero('appFerias'), ausencias: numero('appAusencias'),
    }, turno('app', numero('espera')), contrato);
    const c = empregado({
      ...valores('salario extras compensadas adicionalExtra diasRepouso diasUteis dsr adicionais dependentes deducoes base13 baseFerias deducao13 deducaoFerias descontos descontosFerias vr va vt outros mesesBeneficios'),
      diasMes: numero('cltMes'), ferias: numero('cltFerias'), ausencias: numero('cltAusencias'),
      divisor: numero('divisor') ?? contrato * 5, calcularDsr: el('calcularDsr').checked,
    }, turno('clt'));
    const e = equivalencia(a, c);
    const folgas = 7 - numero('cltSemana');
    const nota = document.createElement('p');
    nota.className = 'calc-help';
    nota.textContent = 'Regras consultadas em 23/11/2026. Na data escolhida, a regra geral indica até ' + teto
      + ' h semanais normais e ' + repousos + ' dia(s) de repouso remunerado. '
      + (contrato > teto || folgas < repousos ? 'Confira a escala e o instrumento coletivo informado. ' : '')
      + 'A EC 141 e as decisões do STF admitem situações específicas. A simulação mantém a jornada e a folha que você informou.';
    destino.append(nota,
      bloco('Tempo de trabalho', [
        ['Aplicativo · permanência por dia', horas(a.permanencia)],
        ['Aplicativo · pausas livres por dia', horas(a.permanencia - a.dedicado)],
        ['Aplicativo · espera disponível por dia', horas(a.espera)],
        ['Aplicativo · trabalho efetivo por dia', horas(a.efetivo)],
        ['Aplicativo · tempo dedicado por dia', horas(a.dedicado)],
        ['Aplicativo · tempo dedicado por ano', horas(a.horas)],
        ['Aplicativo · acima da jornada contratual CLT por semana (comparação econômica)', horas(a.excedente)],
        ['CLT · permanência por dia', horas(c.permanencia)],
        ['CLT · pausas livres por dia', horas(c.permanencia - c.dedicado)],
        ['CLT · horas efetivas por dia', horas(c.efetivo)],
        ['CLT · dias livres por semana típica', decimal.format(folgas)],
        ['CLT · tempo dedicado por ano', horas(c.horas)],
      ]),
      bloco('Dinheiro no aplicativo', [
        ['Dias trabalhados por ano', decimal.format(a.diasAno)],
        ['Faturamento anual com bônus', dinheiro(a.faturamentoAno)],
        ['Resultado operacional por dia típico', dinheiro(a.operacionalDia)],
        ['Resultado operacional por ano', dinheiro(a.operacionalAno)],
        ['INSS ou DAS, seguros e demais tributos no ano', dinheiro(a.despesas)],
        ['Renda anual antes da reserva', dinheiro(a.rendaComparavel)],
        ['Valor separado para a reserva no ano', dinheiro(a.reservaAno)],
        ['Disponível por hora efetiva', dinheiro(porHora(a.disponivel, a.efetivo * a.diasAno))],
        ['Disponível por hora dedicada', dinheiro(porHora(a.disponivel, a.horas))],
        ['Disponível médio por dia trabalhado', dinheiro(a.dia)],
        ['Disponível equivalente por semana trabalhada', dinheiro(a.semanaAtiva)],
        ['Disponível médio por mês do ano', dinheiro(a.disponivel / 12)],
        ['Disponível por ano depois da reserva', dinheiro(a.disponivel)],
      ]),
      bloco('Dinheiro no emprego CLT', [
        ['Bruto no mês normal', dinheiro(c.mensal.bruto)],
        ['Horas extras pagas (valor no mês normal)', dinheiro(c.extra)],
        ['DSR variável no mês normal', dinheiro(c.descanso)],
        ['INSS no mês normal', dinheiro(c.mensal.inss)],
        ['IRRF no mês normal', dinheiro(c.mensal.irrf)],
        ['Líquido no mês normal', dinheiro(c.liquidoMes)],
        ['13º líquido', dinheiro(c.decimo.liquido)],
        ['Adicional de 1/3 de férias bruto', dinheiro(c.terco)],
        ['Férias líquidas antes de outros descontos', dinheiro(c.ferias.liquido)],
        ['Líquido anual projetado', dinheiro(c.liquidoAno)],
        ['Líquido médio por mês do ano', dinheiro(c.liquidoAno / 12)],
        ['Líquido por hora efetiva', dinheiro(porHora(c.liquidoAno, c.efetivo * c.diasAno))],
        ['Líquido por hora dedicada', dinheiro(porHora(c.liquidoAno, c.horas))],
      ]),
      bloco('Benefícios e FGTS da CLT', [
        ['Vale-refeição no mês', dinheiro(numero('vr'))],
        ['Vale-alimentação no mês', dinheiro(numero('va'))],
        ['Vale-transporte no mês', dinheiro(numero('vt'))],
        ['Outros benefícios no mês', dinheiro(numero('outros'))],
        ['Benefícios no mês com pagamento', dinheiro(c.beneficios)],
        ['Benefícios anuais (valor de uso informado)', dinheiro(c.beneficiosAno)],
        ['FGTS depositado no mês normal', dinheiro(c.mensal.fgts)],
        ['FGTS depositado no ano', dinheiro(c.fgtsAno)],
      ]),
      bloco('Metas para o aplicativo', [
        ['Diferença no mês médio · aplicativo antes da reserva menos CLT líquido', dinheiro((a.rendaComparavel - c.liquidoAno) / 12)],
        ['Diferença no ano · aplicativo antes da reserva menos CLT líquido', dinheiro(a.rendaComparavel - c.liquidoAno)],
        ['CLT no mesmo tempo anual do aplicativo · líquido', dinheiro(e.caixaMesmoTempo)],
        ['CLT no mesmo tempo anual do aplicativo · líquido + benefícios', dinheiro(e.mesmoTempo)],
        ['Diferença no mesmo tempo · aplicativo antes da reserva menos CLT líquido + benefícios', dinheiro(a.rendaComparavel - e.mesmoTempo)],
        ['Faturamento diário para igualar o líquido anual CLT', dinheiro(e.faturamentoCaixa / a.diasAno)],
        ['Faturamento diário para igualar líquido + benefícios anuais CLT', dinheiro(e.faturamentoPacote / a.diasAno)],
        ['Faturamento diário para igualar líquido + benefícios por hora dedicada', dinheiro(e.faturamentoMesmoTempo / a.diasAno)],
        ['Faturamento anual sem bônus para essa meta por hora', dinheiro(e.faturamentoMesmoTempo)],
      ]));
  } catch (e) {
    erro.textContent = e.message;
    erro.hidden = false;
  }
  if (moverFoco && erro.hidden) destino.focus();
}

el('comparar').addEventListener('click', () => calcular(true));
for (const campo of document.querySelectorAll('main input')) campo.addEventListener('input', () => calcular());
calcular();
