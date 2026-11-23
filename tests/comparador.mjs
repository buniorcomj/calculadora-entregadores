import assert from 'node:assert/strict';
import test from 'node:test';
import { aplicativo, empregado, equivalencia, folha, jornada, porHora, regraJornada } from '../assets/js/comparador.mjs';

const appDados = {
  receita: 200, custo: 50, diasSemana: 5, diasMes: 20, ferias: 20, ausencias: 10,
  bonus: 1000, previdencia: 100, seguro: 50, tributos: 10, reserva: 40,
};
const cltDados = {
  salario: 3500, diasMes: 22, ferias: 22, ausencias: 0, extras: 0, compensadas: 0,
  adicionalExtra: 50, divisor: 200, diasRepouso: 4, diasUteis: 25, calcularDsr: true,
  dsr: 0, adicionais: 0, dependentes: 0, deducoes: 0, deducao13: 0, deducaoFerias: 0,
  descontos: 0, descontosFerias: 0, vr: 200, va: 100, vt: 50, outros: 10, mesesBeneficios: 11,
};
const tempoClt = jornada('08:00', '18:00', 120);

test('Distingue permanência, almoço, outras pausas, espera e horas em serviço', () => {
  assert.deepEqual(tempoClt, { permanencia: 10, dedicado: 8, efetivo: 8, espera: 0 });
  assert.deepEqual(jornada('08:00', '20:00', 60, 60, 90),
    { permanencia: 12, dedicado: 10, efetivo: 8.5, espera: 1.5 });
  assert.equal(jornada('19:00', '07:00', 60).dedicado, 11);
});

test('Rejeita horários iguais, pausas excessivas e espera superior ao tempo dedicado', () => {
  assert.throws(() => jornada('08:00', '08:00'));
  assert.throws(() => jornada('08:00', '09:00', 30, 30));
  assert.throws(() => jornada('08:00', '09:00', 30, 0, 31));
  assert.equal(porHora(100, jornada('08:00', '09:00', 0, 0, 60).efetivo), null);
});

test('INSS e IRRF de 2026 em limites e faixa intermediária', () => {
  assert.equal(folha(1621).inss, 121.58);
  assert.equal(folha(2902.84).inss, 236.94);
  assert.equal(folha(5000).irrf, 0);
  assert.equal(folha(6000).irrf, 385.10);
  assert.equal(folha(7350).irrf, 884.13);
  assert.equal(folha(9000).inss, folha(8475.55).inss);
  assert.ok(folha(6000, 2).irrf < folha(6000).irrf);
});

test('Ano CLT usa 11 folhas, férias gozadas mais terço e 13º separado', () => {
  const c = empregado(cltDados, tempoClt);
  assert.equal(c.liquidoMes, 3191.40);
  assert.equal(c.terco, 1166.67);
  assert.equal(c.decimo.inss, folha(3500).inss);
  assert.equal(c.liquidoAno, 42508.62);
  assert.equal(c.fgtsAno, 3733.33);
  assert.equal(c.beneficiosAno, 3960);
  assert.equal(c.horas, 1936);
});

test('Horas compensadas não entram no pagamento nem no DSR calculado', () => {
  const c = empregado({ ...cltDados, extras: 12, compensadas: 4 }, tempoClt);
  assert.equal(c.extra, 210);
  assert.equal(c.descanso, 33.6);
  assert.equal(c.mensal.bruto, 3743.60);
  assert.throws(() => empregado({ ...cltDados, extras: 1, compensadas: 2 }, tempoClt));
});

test('Resultado operacional, projeção e custos do autônomo são separados', () => {
  const a = aplicativo(appDados, jornada('08:00', '20:00', 60, 60, 90), 40);
  assert.equal(a.diasAno, 210);
  assert.equal(a.operacionalAno, 32500);
  assert.equal(a.rendaComparavel, 30580);
  assert.equal(a.reservaAno, 480);
  assert.equal(a.disponivel, 30100);
  assert.equal(a.excedente, 10);
  assert.equal(a.horas, 2100);
  assert.throws(() => aplicativo({ ...appDados, ausencias: 240 }, tempoClt, 40));
});

test('A meta de faturamento cobre custos, abate bônus e exclui FGTS', () => {
  const a = aplicativo(appDados, tempoClt, 40);
  const c = empregado(cltDados, tempoClt);
  const e = equivalencia(a, c);
  assert.equal(e.faturamentoCaixa, c.liquidoAno + 11420);
  const semReserva = aplicativo({ ...appDados, reserva: 0 }, tempoClt, 40);
  assert.deepEqual(equivalencia(semReserva, c), e);
  assert.equal(semReserva.rendaComparavel, a.rendaComparavel);
  assert.equal(e.faturamentoPacote, e.faturamentoCaixa + c.beneficiosAno);
  assert.equal(e.faturamentoMesmoTempo, e.mesmoTempo + 11420);
});

test('Transição da EC 141 por data de referência', () => {
  assert.deepEqual(regraJornada('2026-12-15').slice(1), [44, 1]);
  assert.deepEqual(regraJornada('2026-12-16').slice(1), [42, 2]);
  assert.deepEqual(regraJornada('2027-12-16').slice(1), [40, 2]);
});
