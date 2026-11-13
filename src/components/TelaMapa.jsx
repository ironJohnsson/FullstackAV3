import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Layers, MapPin, Compass, Eye } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';

function MapViewportController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 0.9 });
    }
  }, [map, center, zoom]);
  return null;
}

const THEMATIC_LAYERS = [
  {
    id: 'ievs',
    label: 'Índice de Vulnerabilidade Socioenergética (IEVS 0–100)',
    unit: 'pts',
    description:
      'Combina restrição de renda (40%), adensamento/saneamento (30%) e estresse térmico/urbano (30%) nos 172 setores censitários.',
    legend: [
      { color: '#ef4444', label: 'Muito Alta (≥ 60 pts)' },
      { color: '#f97316', label: 'Alta (50 a 59,9 pts)' },
      { color: '#eab308', label: 'Média-Alta (40 a 49,9 pts)' },
      { color: '#22c55e', label: 'Moderada / Baixa (< 40 pts)' },
    ],
  },
  {
    id: 'renda',
    label: 'Rendimento Médio do Responsável (V06004 - R$)',
    unit: 'R$',
    description:
      'Valor do rendimento nominal médio mensal das pessoas responsáveis pelo domicílio no setor censitário (IBGE Censo 2022).',
    legend: [
      { color: '#dc2626', label: 'Até R$ 1.400 (Crítico ≤ 1,15 SM)' },
      { color: '#f97316', label: 'R$ 1.401 a R$ 1.818 (Baixa Renda ≤ 1,5 SM)' },
      { color: '#facc15', label: 'R$ 1.819 a R$ 2.800 (Intermediário)' },
      { color: '#10b981', label: 'Acima de R$ 2.800 (Condomínios / Bordas)' },
    ],
  },
  {
    id: 'densidade',
    label: 'Densidade Demográfica (hab/km²)',
    unit: 'hab/km²',
    description:
      'Pressão demográfica por quilômetro quadrado (V0001 / AREA_KM2), indicador chave de compacidade construtiva e ilha de calor.',
    legend: [
      { color: '#be123c', label: 'Extrema (≥ 30.000 hab/km²)' },
      { color: '#f43f5e', label: 'Muito Alta (20.000 a 29.999 hab/km²)' },
      { color: '#fb923c', label: 'Alta (12.000 a 19.999 hab/km²)' },
      { color: '#38bdf8', label: 'Moderada (< 12.000 hab/km²)' },
    ],
  },
  {
    id: 'tipologia',
    label: 'Tipologia Censitária (Favela e Comunidade Urbana vs. Regular)',
    unit: '',
    description:
      'Classificação operacional do setor censitário no Censo 2022 (CD_TIPO = 1: Favela e Comunidade Urbana / Aglomerado Subnormal vs. CD_TIPO = 0: Regular).',
    legend: [
      { color: '#e11d48', label: 'CD_TIPO = 1: Favela e Comunidade Urbana (FCU)' },
      { color: '#0284c7', label: 'CD_TIPO = 0: Setor Urbano Regular' },
    ],
  },
];

function getSectorColor(props, theme) {
  if (theme === 'ievs') {
    const v = Number(props.ievs_setor || props.IEVS_EXPLORATORIO || 50);
    if (v >= 60) return '#ef4444';
    if (v >= 50) return '#f97316';
    if (v >= 40) return '#eab308';
    return '#22c55e';
  }
  if (theme === 'renda') {
    const r = Number(props.renda_media_resp || props.RENDA_MEDIA_RESP || 0);
    if (r === 0) return '#64748b';
    if (r <= 1400) return '#dc2626';
    if (r <= 1818) return '#f97316';
    if (r <= 2800) return '#facc15';
    return '#10b981';
  }
  if (theme === 'densidade') {
    const d = Number(props.densidade_hab_km2 || props.DENSIDADE_DEMOGRAFICA || 0);
    if (d >= 30000) return '#be123c';
    if (d >= 20000) return '#f43f5e';
    if (d >= 12000) return '#fb923c';
    return '#38bdf8';
  }
  if (theme === 'tipologia') {
    return String(props.cd_tipo) === '1' ? '#e11d48' : '#0284c7';
  }
  return '#38bdf8';
}

export default function TelaMapa({ data }) {
  const [granularity, setGranularity] = useState('setores_com_bairros');
  const [theme, setTheme] = useState('ievs');
  const [focusArea, setFocusArea] = useState('BOTH');
  const [selectedFeature, setSelectedFeature] = useState(null);

  const activeLayerMeta = THEMATIC_LAYERS.find((l) => l.id === theme) || THEMATIC_LAYERS[0];

  const viewport = useMemo(() => {
    if (focusArea === '2927408018') return { center: [-12.9462, -38.4478], zoom: 15 };
    if (focusArea === '2927408117') return { center: [-12.9712, -38.4632], zoom: 15 };
    return { center: [-12.9595, -38.4565], zoom: 14 };
  }, [focusArea]);

  const filteredSetoresGeo = useMemo(() => {
    if (!data.geojsonSetores?.features) return { type: 'FeatureCollection', features: [] };
    const feats = data.geojsonSetores.features.filter((f) => {
      if (focusArea === 'ALL' || focusArea === 'BOTH') return true;
      return f.properties.cd_bairro === focusArea;
    });
    return { type: 'FeatureCollection', features: feats };
  }, [data.geojsonSetores, focusArea]);

  const sectorStats = useMemo(() => {
    const feats = filteredSetoresGeo.features.map((f) => f.properties);
    const total = feats.length;
    const fcuCount = feats.filter((p) => String(p.cd_tipo) === '1').length;
    const lowIncomeCount = feats.filter((p) => p.baixa_renda_1_5sm).length;
    const fcuNames = Array.from(
      new Set(feats.map((p) => p.nm_fcu).filter((n) => n && !n.includes('Fora de FCU')))
    );
    return {
      total,
      fcuCount,
      fcuPct: total ? (fcuCount / total) * 100 : 0,
      lowIncomeCount,
      lowIncomePct: total ? (lowIncomeCount / total) * 100 : 0,
      fcuNames,
    };
  }, [filteredSetoresGeo]);

  function styleBairroFeature(feature) {
    const p = feature.properties;
    const isFoco = p.is_foco;
    if (granularity === 'setores_com_bairros') {
      return {
        fillColor: isFoco ? 'transparent' : '#1e293b',
        weight: isFoco ? 2.5 : 1,
        opacity: 1,
        color: p.cd_bairro === '2927408018' ? '#fb7185' : p.cd_bairro === '2927408117' ? '#38bdf8' : '#475569',
        dashArray: isFoco ? '' : '4 4',
        fillOpacity: isFoco ? 0.02 : 0.2,
      };
    }
    return {
      fillColor: isFoco ? getSectorColor(p, theme) : '#334155',
      weight: isFoco ? 2.5 : 1.2,
      opacity: 1,
      color: isFoco ? '#f8fafc' : '#64748b',
      fillOpacity: isFoco ? 0.72 : 0.35,
    };
  }

  function styleSetorFeature(feature) {
    const p = feature.properties;
    const isSelected = selectedFeature?.cd_setor && selectedFeature.cd_setor === p.cd_setor;
    return {
      fillColor: getSectorColor(p, theme),
      weight: isSelected ? 2.6 : 0.9,
      opacity: 1,
      color: isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.72)',
      fillOpacity: isSelected ? 0.9 : 0.74,
    };
  }

  function onEachSetor(feature, layer) {
    const p = feature.properties;
    layer.on({
      click: () => {
        setSelectedFeature({ type: 'SETOR', ...p });
      },
    });
    layer.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 220px; color: #0f172a;">
        <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
          Setor Censitário Censo 2022
        </div>
        <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px;">
          #${p.cd_setor} — ${p.nm_bairro}
        </div>
        <div style="font-size: 12px; margin-bottom: 6px; padding: 3px 6px; border-radius: 4px; background: ${
          String(p.cd_tipo) === '1' ? '#ffe4e6' : '#e0f2fe'
        }; color: ${String(p.cd_tipo) === '1' ? '#be123c' : '#0369a1'}; font-weight: 600;">
          ${p.tipologia_label} (${p.nm_fcu})
        </div>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr><td><strong>População (V0001):</strong></td><td style="text-align:right">${formatNumber(p.populacao)} hab</td></tr>
          <tr><td><strong>Domicílios Ocup. (V0007):</strong></td><td style="text-align:right">${formatNumber(p.domicilios_ocupados)} dom</td></tr>
          <tr><td><strong>Densidade:</strong></td><td style="text-align:right">${formatNumber(p.densidade_hab_km2, 1)} hab/km²</td></tr>
          <tr><td><strong>Renda Média (V06004):</strong></td><td style="text-align:right">${formatCurrency(p.renda_media_resp)}</td></tr>
          <tr><td><strong>Renda Mediana (V06006):</strong></td><td style="text-align:right">${formatCurrency(p.renda_mediana_resp)}</td></tr>
          <tr><td><strong>IEVS Setorial:</strong></td><td style="text-align:right"><strong>${formatNumber(p.ievs_setor, 1)} / 100</strong></td></tr>
        </table>
      </div>
    `);
  }

  function onEachBairro(feature, layer) {
    const p = feature.properties;
    layer.on({
      click: () => {
        setSelectedFeature({ type: 'BAIRRO', ...p });
      },
    });
    layer.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 220px; color: #0f172a;">
        <div style="font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase;">
          Bairro Oficial — Malha IBGE CD2022
        </div>
        <div style="font-size: 15px; font-weight: 800; margin-bottom: 6px;">
          ${p.nm_bairro} (${p.cd_bairro})
        </div>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr><td><strong>População:</strong></td><td style="text-align:right">${formatNumber(p.populacao)} hab</td></tr>
          <tr><td><strong>Domicílios Totais:</strong></td><td style="text-align:right">${formatNumber(p.domicilios_totais)}</td></tr>
          <tr><td><strong>Área Territorial:</strong></td><td style="text-align:right">${formatNumber(p.area_km2, 3)} km²</td></tr>
          <tr><td><strong>Densidade:</strong></td><td style="text-align:right">${formatNumber(p.densidade_hab_km2, 1)} hab/km²</td></tr>
          ${
            p.RENDA_MEDIA_RESP
              ? `<tr><td><strong>Renda Média:</strong></td><td style="text-align:right">${formatCurrency(p.RENDA_MEDIA_RESP)}</td></tr>
                 <tr><td><strong>IEVS Base:</strong></td><td style="text-align:right"><strong>${formatNumber(p.IEVS_EXPLORATORIO, 2)} / 100</strong></td></tr>`
              : ''
          }
        </table>
      </div>
    `);
  }

  return (
    <div className="screen-container">
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">
              Tela 03 · Mapa Temático de Vulnerabilidade (Malha Oficial IBGE Censo 2022)
            </span>
            <h2 className="section-title">
              Cartografia de Limites de Bairros e 172 Setores Censitários (Beiru/Tancredo Neves e Pernambués)
            </h2>
          </div>
        </div>

        <div className="map-controls-grid">
          <div className="map-control-box">
            <label className="control-label">
              <Layers size={14} /> Camada Temática (Coroplético)
            </label>
            <select className="select-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
              {THEMATIC_LAYERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="map-control-box">
            <label className="control-label">
              <Eye size={14} /> Granularidade Geográfica
            </label>
            <select
              className="select-input"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
            >
              <option value="setores_com_bairros">
                Setores Censitários Censo 2022 (172 setores) + Contorno de Bairros
              </option>
              <option value="bairros">
                Poligonais de Bairros Oficiais (Beiru, Pernambués + 11 Bairros Vizinhos)
              </option>
            </select>
          </div>

          <div className="map-control-box">
            <label className="control-label">
              <Compass size={14} /> Enquadramento / Zoom Territorial
            </label>
            <div className="btn-group-inline">
              <button
                type="button"
                className={`territory-pill ${focusArea === 'BOTH' ? 'active' : ''}`}
                onClick={() => setFocusArea('BOTH')}
              >
                Ambos (172 set.)
              </button>
              <button
                type="button"
                className={`territory-pill ${focusArea === '2927408018' ? 'active' : ''}`}
                onClick={() => setFocusArea('2927408018')}
              >
                Beiru (72 set.)
              </button>
              <button
                type="button"
                className={`territory-pill ${focusArea === '2927408117' ? 'active' : ''}`}
                onClick={() => setFocusArea('2927408117')}
              >
                Pernambués (100 set.)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="map-workspace-grid">
        <div className="map-canvas-card">
          <MapContainer
            center={viewport.center}
            zoom={viewport.zoom}
            style={{ height: '560px', width: '100%', borderRadius: '10px' }}
          >
            <MapViewportController center={viewport.center} zoom={viewport.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Malha Oficial: IBGE Censo Demográfico 2022'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {data.geojsonBairros && (
              <GeoJSON
                key={`bairros-${granularity}-${theme}`}
                data={data.geojsonBairros}
                style={styleBairroFeature}
                onEachFeature={onEachBairro}
              />
            )}

            {granularity === 'setores_com_bairros' && filteredSetoresGeo && (
              <GeoJSON
                key={`setores-${focusArea}-${theme}-${selectedFeature?.cd_setor || 'none'}`}
                data={filteredSetoresGeo}
                style={styleSetorFeature}
                onEachFeature={onEachSetor}
              />
            )}
          </MapContainer>

          <div className="map-legend-bar">
            <div className="legend-title">
              <strong>Legenda ({activeLayerMeta.label}):</strong>
              <span>{activeLayerMeta.description}</span>
            </div>
            <div className="legend-items-row">
              {activeLayerMeta.legend.map((item, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-Swatch" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
              {granularity === 'setores_com_bairros' && (
                <>
                  <div className="legend-item">
                    <span className="legend-Swatch-outline" style={{ borderColor: '#fb7185' }} />
                    <span>Limite Beiru/Tancredo Neves</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-Swatch-outline" style={{ borderColor: '#38bdf8' }} />
                    <span>Limite Pernambués</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="map-sidebar-card">
          <div className="sidebar-section">
            <span className="section-eyebrow">Síntese dos Setores Exibidos</span>
            <h3 style={{ margin: '4px 0 10px', fontSize: '1rem', fontWeight: 700 }}>
              {sectorStats.total} Setores Censitários (IBGE 2022)
            </h3>
            <div className="mini-stat-grid">
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-rose)' }}>
                  {sectorStats.fcuCount} ({formatNumber(sectorStats.fcuPct, 1)}%)
                </span>
                <span className="mini-stat-lbl">Setores em Favelas e Comunidades Urbanas (CD_TIPO = 1)</span>
              </div>
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-amber)' }}>
                  {sectorStats.lowIncomeCount} ({formatNumber(sectorStats.lowIncomePct, 1)}%)
                </span>
                <span className="mini-stat-lbl">Setores com Renda Média ≤ 1,5 SM (R$ 1.818)</span>
              </div>
            </div>

            <div className="fcu-tags-box">
              <span className="fcu-tags-title">
                Comunidades Urbanas (FCUs) mapeadas pelo IBGE nestes setores:
              </span>
              <div className="fcu-tags-list">
                {sectorStats.fcuNames.map((name) => (
                  <span key={name} className="fcu-tag">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className="sidebar-divider" />

          <div className="sidebar-section">
            <span className="section-eyebrow">Inspeção de Feição (Clique no Mapa)</span>
            {selectedFeature ? (
              <div className="feature-inspector">
                <h4>
                  {selectedFeature.type === 'SETOR'
                    ? `Setor #${selectedFeature.cd_setor}`
                    : `Bairro: ${selectedFeature.nm_bairro}`}
                </h4>
                <p className="inspector-sub">
                  {selectedFeature.type === 'SETOR'
                    ? `${selectedFeature.nm_bairro} — ${selectedFeature.tipologia_label}`
                    : `Código IBGE: ${selectedFeature.cd_bairro} · Subdistrito: ${selectedFeature.nm_subdist}`}
                </p>

                <div className="inspector-rows">
                  <div className="insp-row">
                    <span>População Residente (V0001):</span>
                    <strong>{formatNumber(selectedFeature.populacao)} hab.</strong>
                  </div>
                  <div className="insp-row">
                    <span>Domicílios Ocupados (V0007):</span>
                    <strong>{formatNumber(selectedFeature.domicilios_ocupados)} dom.</strong>
                  </div>
                  <div className="insp-row">
                    <span>Área Oficial (AREA_KM2):</span>
                    <strong>{formatNumber(selectedFeature.area_km2, 4)} km²</strong>
                  </div>
                  <div className="insp-row">
                    <span>Densidade Demográfica:</span>
                    <strong>{formatNumber(selectedFeature.densidade_hab_km2, 1)} hab/km²</strong>
                  </div>
                  <div className="insp-row">
                    <span>Média de Moradores (V0005):</span>
                    <strong>{formatNumber(selectedFeature.media_moradores, 2)} mor/dom</strong>
                  </div>
                  {(selectedFeature.renda_media_resp !== undefined ||
                    selectedFeature.RENDA_MEDIA_RESP !== undefined) && (
                    <>
                      <div className="insp-row">
                        <span>Renda Média Resp. (V06004):</span>
                        <strong style={{ color: 'var(--accent-amber)' }}>
                          {formatCurrency(
                            selectedFeature.renda_media_resp ?? selectedFeature.RENDA_MEDIA_RESP
                          )}
                        </strong>
                      </div>
                      <div className="insp-row">
                        <span>Renda Mediana Resp. (V06006):</span>
                        <strong>
                          {formatCurrency(
                            selectedFeature.renda_mediana_resp ?? selectedFeature.RENDA_MEDIANA_RESP
                          )}
                        </strong>
                      </div>
                    </>
                  )}
                  {(selectedFeature.ievs_setor !== undefined ||
                    selectedFeature.IEVS_EXPLORATORIO !== undefined) && (
                    <div className="insp-row highlight-row">
                      <span>IEVS Exploratório:</span>
                      <strong style={{ color: 'var(--accent-rose)' }}>
                        {formatNumber(
                          selectedFeature.ievs_setor ?? selectedFeature.IEVS_EXPLORATORIO,
                          2
                        )}{' '}
                        / 100
                      </strong>
                    </div>
                  )}
                  {selectedFeature.nm_fcu && (
                    <div className="insp-row">
                      <span>Comunidade Urbana (NM_FCU):</span>
                      <strong>{selectedFeature.nm_fcu}</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-inspector">
                <MapPin size={24} style={{ color: 'var(--accent-blue)', marginBottom: 8 }} />
                <p>
                  Clique em qualquer um dos <strong>172 Setores Censitários</strong> ou nos polígonos de{' '}
                  <strong>Bairro</strong> no mapa ao lado para inspecionar seus dados oficiais do Censo 2022.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
