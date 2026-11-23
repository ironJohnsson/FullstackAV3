/**
 * Testes de renderização das telas (sem navegador): garantem que as informações
 * exigidas pela Situação de Aprendizagem aparecem na interface.
 * A tela do mapa depende do Leaflet (DOM real) e é verificada no build.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import bundle from '../../data/processed/observatorio_bundle.json';
import TelaVisaoGeral from './TelaVisaoGeral';
import TelaComparativo from './TelaComparativo';
import TelaEnergiaIEVS from './TelaEnergiaIEVS';
import TelaMetodologiaAnalise from './TelaMetodologiaAnalise';

const data = {
  territories: bundle.territories,
  fontes: bundle.fontes,
  indicadores: bundle.indicadores,
  observacoes: bundle.observacoes,
  analyses: bundle.analyses,
  perfisTerritoriais: bundle.perfis_territoriais,
  epeBahiaSeries: bundle.epe_bahia_series,
  ievsSensibilidade: bundle.ievs_sensibilidade,
  resumoSetores: bundle.resumo_setores,
};

// Remove tags e normaliza espaços para comparar apenas o texto visível
const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .replace(/\s+/g, ' ');

describe('Tela 1 — Visão geral', () => {
  const html = text(
    renderToStaticMarkup(<TelaVisaoGeral data={data} selectedBairro="2927408018" setSelectedBairro={() => {}} />)
  );

  it('mostra população, domicílios, rendimento e seleção de bairro', () => {
    expect(html).toContain('População Residente');
    expect(html).toContain('38.329');
    expect(html).toContain('Domicílios Ocupados');
    expect(html).toContain('Rendimento Médio');
    expect(html).toContain('Pernambués');
  });

  it('deixa fonte e ano visíveis em cada indicador', () => {
    expect(html).toContain('IBGE · Censo 2022');
    expect(html).toContain('Ref: 2022');
  });

  it('identifica o IEVS como proxy', () => {
    expect(html).toContain('IEVS Exploratório');
    expect(html).toContain('Proxy / estimativa');
  });
});

describe('Tela 2 — Comparativo territorial', () => {
  const html = text(renderToStaticMarkup(<TelaComparativo data={data} />));

  it('compara os dois bairros com valores calculados a partir dos dados', () => {
    expect(html).toContain('Beiru: 38.329 hab.');
    expect(html).toContain('Pernambués: 52.564 hab.');
    expect(html).toContain('Exportar (.CSV)');
  });

  it('não contém a afirmação sem evidência sobre condomínios', () => {
    expect(html).not.toMatch(/condom[ií]nios/i);
  });
});

describe('Tela 4 — Análise energética', () => {
  const html = text(renderToStaticMarkup(<TelaEnergiaIEVS data={data} />));

  it('deixa sempre visível que a EPE é estadual e não é atribuída aos bairros', () => {
    expect(html).toContain('Escala estadual');
    expect(html).toContain('não são atribuídos aos bairros');
  });

  it('mostra consumo e consumidores da Bahia', () => {
    expect(html).toContain('Consumo residencial · Bahia');
    expect(html).toContain('Unidades consumidoras · Bahia');
    expect(html).toContain('7.555,35');
  });

  it('calcula a faixa de consumo médio a partir da série', () => {
    const valores = data.epeBahiaSeries.map((r) => r.consumo_medio_mensal_kwh_uc);
    const min = Math.min(...valores).toFixed(1).replace('.', ',');
    const max = Math.max(...valores).toFixed(1).replace('.', ',');
    expect(html).toContain(`variou entre ${min} e ${max} kWh`);
    expect(html).not.toContain('no Censo 2022 e');
  });
});

describe('Tela 5 — Metodologia e fontes', () => {
  const html = text(renderToStaticMarkup(<TelaMetodologiaAnalise data={data} />));

  it('lista o dicionário completo de indicadores com fórmula e limitações', () => {
    expect(html).toContain(`${data.indicadores.length} de ${data.indicadores.length} indicadores`);
    expect(html).toContain('Fórmula de Cálculo');
    expect(html).toContain('Limitações');
  });

  it('dá acesso às 8 questões e às fontes', () => {
    expect(html).toContain('Desafio Analítico (8 Questões)');
    expect(html).toContain('Fontes Oficiais');
  });
});
