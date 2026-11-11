import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabaseClient';
import bundleData from '../../data/processed/observatorio_bundle.json';
import geojsonBairros from '../../data/processed/geojson_bairros.json';
import geojsonSetores from '../../data/processed/geojson_setores.json';

/**
 * Camada de Persistência e Consulta Relacional — Observatório Socioenergético
 * Consulta prioritariamente as 5 tabelas persistidas no PostgreSQL / Supabase
 * (`territories`, `fontes`, `indicadores`, `observacoes`, `analyses`) usando
 * exclusivamente a chave pública `anon` (protegida por RLS).
 * Caso as variáveis de ambiente ainda não estejam apontadas para uma instância ativa,
 * mantém continuidade operacional com o espelho relacional gerado pelo pipeline ETL.
 */
export async function fetchObservatorioData() {
  const supabase = getSupabaseClient();
  const cfg = getStoredSupabaseConfig();

  if (supabase) {
    try {
      const [
        { data: territories, error: errT },
        { data: fontes, error: errF },
        { data: indicadores, error: errI },
        { data: observacoes, error: errO },
        { data: analyses, error: errA },
      ] = await Promise.all([
        supabase.from('territories').select('*').order('id'),
        supabase.from('fontes').select('*').order('id'),
        supabase.from('indicadores').select('*').order('id'),
        supabase.from('observacoes').select('*').order('id'),
        supabase.from('analyses').select('*').order('questao_numero'),
      ]);

      const firstError = errT || errF || errI || errO || errA;
      if (!firstError && territories?.length && indicadores?.length && observacoes?.length) {
        return {
          connectionStatus: {
            mode: 'supabase_live',
            label: 'Conectado ao Supabase PostgreSQL (Live API)',
            url: cfg.url,
            tablesLoaded: 5,
            totalObservacoes: observacoes.length,
          },
          territories,
          fontes: fontes || bundleData.fontes,
          indicadores,
          observacoes: observacoes.map((o) => ({
            ...o,
            valor: Number(o.valor),
            ano: Number(o.ano),
          })),
          analyses: analyses?.length ? analyses : bundleData.analyses,
          perfisTerritoriais: bundleData.perfis_territoriais,
          epeBahiaSeries: bundleData.epe_bahia_series,
          ievsSensibilidade: bundleData.ievs_sensibilidade,
          resumoSetores: bundleData.resumo_setores,
          geojsonBairros,
          geojsonSetores,
        };
      }
      console.warn('[Observatório] Aviso ao consultar tabelas Supabase, ativando espelho ETL:', firstError?.message);
    } catch (err) {
      console.warn('[Observatório] Falha de rede ao conectar ao Supabase, usando espelho ETL:', err);
    }
  }

  return {
    connectionStatus: {
      mode: 'etl_snapshot',
      label: cfg.isConfigured
        ? 'Espelho Relacional ETL (Aguardando criação das tabelas no Supabase)'
        : 'Espelho Relacional Pós-ETL (Pronto para vincular VITE_SUPABASE_URL)',
      url: cfg.url || null,
      tablesLoaded: 5,
      totalObservacoes: bundleData.observacoes.length,
    },
    territories: bundleData.territories,
    fontes: bundleData.fontes,
    indicadores: bundleData.indicadores,
    observacoes: bundleData.observacoes,
    analyses: bundleData.analyses,
    perfisTerritoriais: bundleData.perfis_territoriais,
    epeBahiaSeries: bundleData.epe_bahia_series,
    ievsSensibilidade: bundleData.ievs_sensibilidade,
    resumoSetores: bundleData.resumo_setores,
    geojsonBairros,
    geojsonSetores,
  };
}

/**
 * Executa consulta relacional filtrada (equivalente à View `vw_observacoes_detalhadas`)
 */
export function queryObservacoesDetalhadas(data, filters = {}) {
  const {
    territorioCodigo = 'ALL',
    dimensao = 'ALL',
    fonteInstituicao = 'ALL',
    classificacao = 'ALL',
    ano = 'ALL',
    search = '',
  } = filters;

  const terrById = Object.fromEntries(data.territories.map((t) => [t.id, t]));
  const indById = Object.fromEntries(data.indicadores.map((i) => [i.id, i]));
  const fonteById = Object.fromEntries(data.fontes.map((f) => [f.id, f]));

  const q = search.trim().toLowerCase();

  return data.observacoes
    .map((o) => {
      const terr = terrById[o.territorio_id];
      const ind = indById[o.indicador_id];
      const fonte = fonteById[o.fonte_id];
      if (!terr || !ind || !fonte) return null;
      return {
        ...o,
        territorio: terr,
        indicador: ind,
        fonte,
      };
    })
    .filter(Boolean)
    .filter((row) => {
      if (territorioCodigo !== 'ALL' && row.territorio.codigo_ibge !== territorioCodigo) return false;
      if (dimensao !== 'ALL' && row.indicador.dimensao !== dimensao) return false;
      if (fonteInstituicao !== 'ALL' && row.fonte.instituicao !== fonteInstituicao) return false;
      if (classificacao !== 'ALL' && row.indicador.classificacao !== classificacao) return false;
      if (ano !== 'ALL' && String(row.ano) !== String(ano)) return false;
      if (q) {
        const hay = `${row.indicador.nome} ${row.indicador.codigo} ${row.indicador.descricao} ${row.territorio.nome} ${row.indicador.dimensao}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
}
