import { regras } from './regras-clt.mjs';

const centavos = valor => Math.round(valor * 100 + 1e-8) / 100;
export const porHora = (valor, horas) => horas > 0 ? valor / horas : null;

export function folha(bruto, dependentes = 0, deducoes = 0) {
  bruto = centavos(bruto);
  let anterior = 0;
  let contribuicao = 0;
  for (const [limite, aliquota] of regras.inss) {
    contribuicao += Math.max(0, Math.min(bruto, limite) - anterior) * aliquota;
    anterior = limite;
  }
  const inss = centavos(contribuicao);
  const base = centavos(Math.max(0, bruto - Math.max(regras.simplificado,
    inss + dependentes * regras.dependente + deducoes)));
  const [, aliquota, deducao] = regras.irrf.find(([limite]) => base <= limite);
  const imposto = centavos(Math.max(0, base * aliquota - deducao));
  const r = regras.reducao;
  const reducao = bruto <= r.integral ? r.maximo
    : bruto <= r.limite ? Math.max(0, r.constante - r.fator * bruto) : 0;
  const irrf = centavos(Math.max(0, imposto - centavos(reducao)));
  return { bruto, inss, irrf, liquido: centavos(bruto - inss - irrf), fgts: centavos(bruto * regras.fgts) };
}

function minutos(horario) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) throw new Error('Preencha os horários de início e término.');
  const [hora, minuto] = horario.split(':').map(Number);
  return hora * 60 + minuto;
}

export function jornada(inicio, fim, almoco = 0, pausas = 0, espera = 0) {
  const permanencia = (minutos(fim) - minutos(inicio) + 1440) % 1440;
  const dedicado = permanencia - almoco - pausas;
  if (!permanencia || dedicado <= 0 || espera > dedicado) {
    throw new Error('Confira os horários, as pausas e a espera. A jornada precisa ter tempo dedicado.');
  }
  return { permanencia: permanencia / 60, dedicado: dedicado / 60, efetivo: (dedicado - espera) / 60, espera: espera / 60 };
}

export function aplicativo(d, tempo, referenciaSemanal) {
  const diasAno = d.diasMes * 12 - d.ferias - d.ausencias;
  if (diasAno <= 0 || diasAno > 366 || d.diasMes > Math.ceil(d.diasSemana * 31 / 7)) {
    throw new Error('Confira os dias de aplicativo por semana e por mês e os dias de folga e férias no ano.');
  }
  const operacionalDia = d.receita - d.custo;
  const despesas = 12 * (d.previdencia + d.seguro + d.tributos);
  const operacionalAno = operacionalDia * diasAno + d.bonus;
  const rendaComparavel = operacionalAno - despesas;
  const reservaAno = 12 * d.reserva;
  const disponivel = rendaComparavel - reservaAno;
  const horas = tempo.dedicado * diasAno;
  return { ...tempo, diasAno, operacionalDia, operacionalAno, rendaComparavel, reservaAno, disponivel, despesas, horas,
    faturamentoAno: d.receita * diasAno + d.bonus, custoDia: d.custo, bonus: d.bonus,
    dia: disponivel / diasAno, semanaAtiva: disponivel / diasAno * d.diasSemana,
    excedente: Math.max(0, tempo.dedicado * d.diasSemana - referenciaSemanal) };
}

export function empregado(d, tempo) {
  const diasAno = d.diasMes * 12 - d.ferias - d.ausencias;
  if (diasAno <= 0 || diasAno > 366 || d.compensadas > d.extras || d.divisor <= 0 || d.diasUteis <= 0) {
    throw new Error('Confira os dias, o divisor da folha e as horas extras compensadas da CLT.');
  }
  const extra = (d.extras - d.compensadas) * (d.salario / d.divisor) * (1 + d.adicionalExtra / 100);
  const descanso = d.calcularDsr ? extra * d.diasRepouso / d.diasUteis : d.dsr;
  const bruto = centavos(d.salario + extra + descanso + d.adicionais);
  const mensal = folha(bruto, d.dependentes, d.deducoes);
  const base13 = d.base13 ?? bruto;
  const baseFerias = d.baseFerias ?? bruto;
  const decimo = folha(base13, d.dependentes, d.deducao13);
  const terco = centavos(baseFerias / 3);
  const ferias = folha(baseFerias + terco, d.dependentes, d.deducaoFerias);
  const liquidoMes = centavos(mensal.liquido - d.descontos);
  const liquidoAno = centavos(liquidoMes * 11 + ferias.liquido - d.descontosFerias + decimo.liquido);
  const fgtsAno = centavos(11 * mensal.fgts + ferias.fgts + decimo.fgts);
  const beneficios = d.vr + d.va + d.vt + d.outros;
  return { ...tempo, diasAno, mensal, decimo, ferias, terco, descanso, extra, liquidoMes,
    liquidoAno, fgtsAno, beneficios, beneficiosAno: beneficios * d.mesesBeneficios, horas: tempo.dedicado * diasAno };
}

export function equivalencia(app, clt) {
  const caixa = clt.liquidoAno;
  const pacote = caixa + clt.beneficiosAno;
  const caixaMesmoTempo = caixa / clt.horas * app.horas;
  const mesmoTempo = pacote / clt.horas * app.horas;
  const faturamento = meta => Math.max(0, meta + app.despesas + app.custoDia * app.diasAno - app.bonus);
  return { caixaMesmoTempo, mesmoTempo, faturamentoCaixa: faturamento(caixa),
    faturamentoPacote: faturamento(pacote), faturamentoMesmoTempo: faturamento(mesmoTempo) };
}

export function regraJornada(data) {
  return regras.jornada.findLast(([inicio]) => inicio <= data);
}
