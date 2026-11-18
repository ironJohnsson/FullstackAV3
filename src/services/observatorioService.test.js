import { describe, it, expect } from 'vitest';
import bundle from '../../data/processed/observatorio_bundle.json';
import { queryObservacoesDetalhadas, mergePerfisWithObservacoes } from './observatorioService';

const data = {
  territories: bundle.territories,
  fontes: bundle.fontes,
  indicadores: bundle.indicadores,
  observacoes: bundle.observacoes,
};

describe('queryObservacoesDetalhadas (equivalente à view vw_observacoes_detalhadas)', () => {
  it('junta território, indicador e fonte em cada linha', () => {
    const rows = queryObservacoesDetalhadas(data);
    expect(rows).toHaveLength(bundle.observacoes.length);
    for (const r of rows) {
      expect(r.territorio.id).toBe(r.territorio_id);
      expect(r.indicador.id).toBe(r.indicador_id);
      expect(r.fonte.id).toBe(r.fonte_id);
    }
  });

  it('filtra por bairro', () => {
    const rows = queryObservacoesDetalhadas(data, { territorioCodigo: '2927408018' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.territorio.codigo_ibge === '2927408018')).toBe(true);
  });

  it('filtra por dimensão, fonte, classificação e ano', () => {
    const porDimensao = queryObservacoesDetalhadas(data, { dimensao: 'Urbana' });
    expect(porDimensao.length).toBeGreaterThan(0);
    expect(porDimensao.every((r) => r.indicador.dimensao === 'Urbana')).toBe(true);

    const epe = queryObservacoesDetalhadas(data, { fonteInstituicao: 'EPE' });
    expect(epe.length).toBeGreaterThan(0);
    expect(epe.every((r) => r.fonte.instituicao === 'EPE')).toBe(true);

    const proxies = queryObservacoesDetalhadas(data, { classificacao: 'Proxy/estimativa' });
    expect(proxies.every((r) => r.indicador.classificacao === 'Proxy/estimativa')).toBe(true);

    const ano2018 = queryObservacoesDetalhadas(data, { ano: 2018 });
    expect(ano2018.length).toBeGreaterThan(0);
    expect(ano2018.every((r) => r.ano === 2018)).toBe(true);
  });

  it('nunca devolve dados estaduais da EPE ao filtrar um bairro', () => {
    for (const codigo of ['2927408018', '2927408117']) {
      const rows = queryObservacoesDetalhadas(data, { territorioCodigo: codigo, fonteInstituicao: 'EPE' });
      expect(rows).toHaveLength(0);
    }
  });

  it('busca textual por nome ou código do indicador', () => {
    const rows = queryObservacoesDetalhadas(data, { territorioCodigo: '2927408', search: 'ievs_exploratorio' });
    expect(rows).toHaveLength(1);
    expect(rows[0].indicador.codigo).toBe('IEVS_EXPLORATORIO');
  });
});

describe('mergePerfisWithObservacoes (prioridade aos dados do Supabase)', () => {
  const salvador = bundle.territories.find((t) => t.codigo_ibge === '2927408');
  const indBaixaRenda = bundle.indicadores.find((i) => i.codigo === 'PERC_SETORES_BAIXA_RENDA');

  it('sobrescreve o perfil com o valor vindo do banco', () => {
    const observacoesDoBanco = bundle.observacoes.map((o) =>
      o.territorio_id === salvador.id && o.indicador_id === indBaixaRenda.id ? { ...o, valor: 99.9 } : o
    );
    const perfis = mergePerfisWithObservacoes(
      bundle.perfis_territoriais,
      bundle.territories,
      bundle.indicadores,
      observacoesDoBanco
    );
    expect(perfis['2927408'].PERC_SETORES_BAIXA_RENDA).toBe(99.9);
    // Não altera o objeto original do espelho ETL
    expect(bundle.perfis_territoriais['2927408'].PERC_SETORES_BAIXA_RENDA).not.toBe(99.9);
  });

  it('casa por código IBGE e código do indicador, não por id', () => {
    // Simula um banco em que os ids foram gerados em outra ordem
    const shift = 100;
    const territories = bundle.territories.map((t) => ({ ...t, id: t.id + shift }));
    const indicadores = bundle.indicadores.map((i) => ({ ...i, id: i.id + shift }));
    const observacoes = bundle.observacoes.map((o) => ({
      ...o,
      territorio_id: o.territorio_id + shift,
      indicador_id: o.indicador_id + shift,
      valor: o.territorio_id === salvador.id && o.indicador_id === indBaixaRenda.id ? 12.34 : o.valor,
    }));
    const perfis = mergePerfisWithObservacoes(bundle.perfis_territoriais, territories, indicadores, observacoes);
    expect(perfis['2927408'].PERC_SETORES_BAIXA_RENDA).toBe(12.34);
  });

  it('ignora anos diferentes de 2022 e valores inválidos', () => {
    const observacoes = [
      { territorio_id: salvador.id, indicador_id: indBaixaRenda.id, ano: 2010, valor: 1 },
      { territorio_id: salvador.id, indicador_id: indBaixaRenda.id, ano: 2022, valor: NaN },
    ];
    const perfis = mergePerfisWithObservacoes(
      bundle.perfis_territoriais,
      bundle.territories,
      bundle.indicadores,
      observacoes
    );
    expect(perfis['2927408'].PERC_SETORES_BAIXA_RENDA).toBe(
      bundle.perfis_territoriais['2927408'].PERC_SETORES_BAIXA_RENDA
    );
  });
});
