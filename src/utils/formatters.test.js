import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatValueByUnit,
  getClassificacaoBadgeStyle,
  getDimensaoColor,
} from './formatters';

// O Intl usa espaço não separável entre "R$" e o valor
const normalize = (s) => s.replace(/ /g, ' ');

describe('formatNumber', () => {
  it('usa separadores brasileiros', () => {
    expect(formatNumber(1234567.891, 2)).toBe('1.234.567,89');
    expect(formatNumber(38329)).toBe('38.329');
  });

  it('retorna travessão para valores ausentes ou inválidos', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber('abc')).toBe('—');
  });
});

describe('formatCurrency', () => {
  it('formata em reais', () => {
    expect(normalize(formatCurrency(2035.87))).toBe('R$ 2.035,87');
    expect(normalize(formatCurrency(1212, 0))).toBe('R$ 1.212');
  });
});

describe('formatValueByUnit', () => {
  it('formata percentuais, populações e moeda', () => {
    expect(formatValueByUnit(57.33, '%')).toBe('57,33%');
    expect(formatValueByUnit(7.76, '% da renda de referência')).toBe('7,76%');
    expect(formatValueByUnit(52564, 'habitantes')).toBe('52.564');
    expect(normalize(formatValueByUnit(3160.73, 'R$'))).toBe('R$ 3.160,73');
    expect(formatValueByUnit(23425.51, 'hab/km²')).toBe('23.425,5 hab/km²');
  });

  it('distingue índice 0–100 (IEVS) de índice 0–1 (IVS do IPEA)', () => {
    // Regressão: "índice (0 a 100)" também contém o texto "0 a 1"
    expect(formatValueByUnit(66.17, 'índice (0 a 100)')).toBe('66,17 pts');
    expect(formatValueByUnit(0.442, 'índice (0 a 1)')).toBe('0,442');
  });

  it('trata valores ausentes', () => {
    expect(formatValueByUnit(null, '%')).toBe('—');
  });
});

describe('getClassificacaoBadgeStyle', () => {
  it('mapeia as três classificações obrigatórias para variáveis de tema', () => {
    expect(getClassificacaoBadgeStyle('Dado observado')).toMatchObject({
      text: 'var(--badge-obs-text)',
      short: 'Dado observado',
    });
    expect(getClassificacaoBadgeStyle('Indicador derivado').text).toBe('var(--badge-der-text)');
    expect(getClassificacaoBadgeStyle('Proxy/estimativa').short).toBe('Proxy / estimativa');
  });

  it('usa estilo neutro para classificações desconhecidas', () => {
    expect(getClassificacaoBadgeStyle('Outra').text).toBe('var(--badge-neutral-text)');
  });
});

describe('getDimensaoColor', () => {
  it('tem cor para todas as dimensões do PDF e um padrão', () => {
    for (const d of ['Demográfica', 'Econômica', 'Social', 'Habitacional', 'Urbana', 'Energética', 'Socioenergética']) {
      expect(getDimensaoColor(d)).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(getDimensaoColor('Inexistente')).toBe('#64748b');
  });
});
