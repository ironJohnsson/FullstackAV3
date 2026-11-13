import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import {
  Layers,
  MapPin,
  Compass,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Satellite,
  Map as MapIcon,
  Tag,
  RotateCcw,
  X,
  Flame,
  DollarSign,
  Users,
  Home,
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';

function MapViewportController({ boundsData, fallbackViewport, recenterTick }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (boundsData?.features?.length) {
        const bounds = L.geoJSON(boundsData).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [26, 26],
            maxZoom: 16,
            animate: true,
            duration: 0.65,
          });
          return;
        }
      }
    } catch {
      // Fallback for invalid bounds
    }
    if (fallbackViewport?.center && fallbackViewport?.zoom) {
      map.flyTo(fallbackViewport.center, fallbackViewport.zoom, { duration: 0.7 });
    }
  }, [map, boundsData, fallbackViewport, recenterTick]);
  return null;
}

const THEMATIC_LAYERS = [
  {
    id: 'ievs',
    shortLabel: 'IEVS (0–100)',
    label: 'Índice de Vulnerabilidade Socioenergética (IEVS 0–100)',
    unit: 'pts',
    icon: Flame,
    description:
      'Combina restrição de renda (40%), adensamento/saneamento (30%) e estresse térmico/urbano (30%) nos 172 setores censitários.',
    legend: [
      { color: '#ef4444', label: 'Muito Alta (≥ 60 pts)' },
      { color: '#f97316', label: 'Alta (50–59,9 pts)' },
      { color: '#eab308', label: 'Média-Alta (40–49,9 pts)' },
      { color: '#22c55e', label: 'Moderada / Baixa (< 40 pts)' },
    ],
  },
  {
    id: 'renda',
    shortLabel: 'Rendimento Médio',
    label: 'Rendimento Médio do Responsável (V06004 - R$)',
    unit: 'R$',
    icon: DollarSign,
    description:
      'Valor do rendimento nominal médio mensal das pessoas responsáveis pelo domicílio no setor censitário (IBGE Censo 2022).',
    legend: [
      { color: '#dc2626', label: 'Até R$ 1.400 (≤ 1,15 SM)' },
      { color: '#f97316', label: 'R$ 1.401–1.818 (≤ 1,5 SM)' },
      { color: '#eab308', label: 'R$ 1.819–2.800 (Interm.)' },
      { color: '#10b981', label: 'Acima de R$ 2.800' },
    ],
  },
  {
    id: 'densidade',
    shortLabel: 'Densidade Demog.',
    label: 'Densidade Demográfica (hab/km²)',
    unit: 'hab/km²',
    icon: Users,
    description:
      'Pressão demográfica por quilômetro quadrado (V0001 / AREA_KM2), indicador-chave de adensamento construtivo e ilha de calor.',
    legend: [
      { color: '#be123c', label: 'Extrema (≥ 30 mil)' },
      { color: '#f43f5e', label: 'Muito Alta (20–29,9 mil)' },
      { color: '#fb923c', label: 'Alta (12–19,9 mil)' },
      { color: '#38bdf8', label: 'Moderada (< 12 mil)' },
    ],
  },
  {
    id: 'tipologia',
    shortLabel: 'Favelas (FCUs)',
    label: 'Tipologia Censitária (Favela e Comunidade Urbana vs. Regular)',
    unit: '',
    icon: Home,
    description:
      'Classificação oficial do setor censitário no Censo 2022 (CD_TIPO = 1: Favela e Comunidade Urbana vs. CD_TIPO = 0: Regular).',
    legend: [
      { color: '#e11d48', label: 'CD_TIPO = 1: Favela / Comunidade Urbana (FCU)' },
      { color: '#0ea5e9', label: 'CD_TIPO = 0: Setor Urbano Regular' },
    ],
  },
];

function getSectorColor(props, theme) {
  if (theme === 'ievs') {
    const v = Number(props.ievs_setor ?? props.IEVS_EXPLORATORIO ?? 50);
    if (v >= 60) return '#ef4444';
    if (v >= 50) return '#f97316';
    if (v >= 40) return '#eab308';
    return '#22c55e';
  }
  if (theme === 'renda') {
    const r = Number(props.renda_media_resp ?? props.RENDA_MEDIA_RESP ?? 0);
    if (r === 0) return '#64748b';
    if (r <= 1400) return '#dc2626';
    if (r <= 1818) return '#f97316';
    if (r <= 2800) return '#eab308';
    return '#10b981';
  }
  if (theme === 'densidade') {
    const d = Number(props.densidade_hab_km2 ?? props.DENSIDADE_DEMOGRAFICA ?? 0);
    if (d >= 30000) return '#be123c';
    if (d >= 20000) return '#f43f5e';
    if (d >= 12000) return '#fb923c';
    return '#38bdf8';
  }
  if (theme === 'tipologia') {
    return String(props.cd_tipo) === '1' ? '#e11d48' : '#0ea5e9';
  }
  return '#38bdf8';
}

function getIevsSeverity(val) {
  const n = Number(val || 0);
  if (n >= 60) return { label: 'Muito Alta', color: '#ef4444' };
  if (n >= 50) return { label: 'Alta', color: '#f97316' };
  if (n >= 40) return { label: 'Média-Alta', color: '#eab308' };
  return { label: 'Moderada', color: '#22c55e' };
}

function formatPrimaryLayerMetric(props, theme) {
  if (theme === 'ievs') {
    const val = props.ievs_setor ?? props.IEVS_EXPLORATORIO;
    return { label: 'IEVS Setorial', value: `${formatNumber(val, 1)} / 100` };
  }
  if (theme === 'renda') {
    const r = Number(props.renda_media_resp ?? props.RENDA_MEDIA_RESP ?? 0);
    return {
      label: 'Renda Média (V06004)',
      value: r > 0 ? formatCurrency(r) : 'Sigilo / Não divulgado',
    };
  }
  if (theme === 'densidade') {
    const d = props.densidade_hab_km2 ?? props.DENSIDADE_DEMOGRAFICA;
    return { label: 'Densidade', value: `${formatNumber(d, 0)} hab/km²` };
  }
  return {
    label: 'Tipologia IBGE',
    value: String(props.cd_tipo) === '1' ? 'FCU (CD_TIPO = 1)' : 'Regular (CD_TIPO = 0)',
  };
}

function createTerritoryLabelIcon({ name, subtitle, accentColor, isActive }) {
  return L.divIcon({
    className: 'map-territory-pin',
    html: `
      <div class="map-territory-pill ${isActive ? 'is-focused' : ''}">
        <span class="map-territory-dot" style="background:${accentColor}; box-shadow: 0 0 0 3px ${accentColor}33;"></span>
        <div class="map-territory-pill-copy">
          <strong>${name}</strong>
          <span>${subtitle}</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function TelaMapa({ data, appTheme = 'dark' }) {
  const [granularity, setGranularity] = useState('setores_com_bairros');
  const [theme, setTheme] = useState('ievs');
  const [focusArea, setFocusArea] = useState('BOTH');
  const [basemap, setBasemap] = useState('streets');
  const [layerOpacity, setLayerOpacity] = useState(0.76);
  const [showLabels, setShowLabels] = useState(true);
  const [recenterTick, setRecenterTick] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showFcuList, setShowFcuList] = useState(false);
  const [showLayerDesc, setShowLayerDesc] = useState(false);
  const setoresLayerRef = useRef(null);
  const selectedSetorRef = useRef(null);

  useEffect(() => {
    selectedSetorRef.current = selectedFeature?.cd_setor || null;
    if (setoresLayerRef.current) {
      setoresLayerRef.current.setStyle(styleSetorFeature);
    }
  }, [selectedFeature, theme, basemap, appTheme, layerOpacity]);

  const activeLayerMeta = THEMATIC_LAYERS.find((l) => l.id === theme) || THEMATIC_LAYERS[0];
  const beiruPerfil = data.perfisTerritoriais?.['2927408018'];
  const pernPerfil = data.perfisTerritoriais?.['2927408117'];
  const ssaPerfil = data.perfisTerritoriais?.['2927408'];

  const fallbackViewport = useMemo(() => {
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

  const visibleBairrosGeo = useMemo(() => {
    if (!data.geojsonBairros?.features) return { type: 'FeatureCollection', features: [] };
    if (granularity === 'bairros') {
      if (focusArea === 'BOTH') return data.geojsonBairros;
      return {
        type: 'FeatureCollection',
        features: data.geojsonBairros.features.filter((f) => f.properties.cd_bairro === focusArea || !f.properties.is_foco),
      };
    }
    // No modo setorial, destacamos apenas as poligonais oficiais dos bairros-foco para manter o mapa limpo sobre a malha urbana
    const feats = data.geojsonBairros.features.filter((f) => {
      if (!f.properties.is_foco) return false;
      if (focusArea === 'BOTH') return true;
      return f.properties.cd_bairro === focusArea;
    });
    return { type: 'FeatureCollection', features: feats };
  }, [data.geojsonBairros, granularity, focusArea]);

  const boundsData = useMemo(() => {
    if (granularity === 'setores_com_bairros' && filteredSetoresGeo.features.length > 0) {
      return filteredSetoresGeo;
    }
    if (focusArea !== 'BOTH' && data.geojsonBairros?.features) {
      const target = data.geojsonBairros.features.filter((f) => f.properties.cd_bairro === focusArea);
      if (target.length) return { type: 'FeatureCollection', features: target };
    }
    const focusBairros = (data.geojsonBairros?.features || []).filter((f) => f.properties.is_foco);
    return focusBairros.length ? { type: 'FeatureCollection', features: focusBairros } : filteredSetoresGeo;
  }, [granularity, filteredSetoresGeo, focusArea, data.geojsonBairros]);

  const territoryLabels = useMemo(() => {
    const feats = data.geojsonBairros?.features || [];
    const items = [];
    feats.forEach((f) => {
      const code = f.properties?.cd_bairro;
      if (code !== '2927408018' && code !== '2927408117') return;
      if (focusArea !== 'BOTH' && focusArea !== code) return;
      try {
        const center = L.geoJSON(f).getBounds().getCenter();
        const isBeiru = code === '2927408018';
        const perfil = isBeiru ? beiruPerfil : pernPerfil;
        const ievsLabel = perfil?.IEVS_EXPLORATORIO ? `IEVS ${formatNumber(perfil.IEVS_EXPLORATORIO, 1)}` : '';
        items.push({
          code,
          position: [center.lat, center.lng],
          name: isBeiru ? 'Beiru / Tancredo Neves' : 'Pernambués',
          subtitle: isBeiru ? `72 set. · ${ievsLabel}` : `100 set. · ${ievsLabel}`,
          accentColor: isBeiru ? '#fb7185' : '#38bdf8',
          isActive: focusArea === code,
        });
      } catch {
        // Ignore malformed geometry center
      }
    });
    return items;
  }, [data.geojsonBairros, focusArea, beiruPerfil, pernPerfil]);

  const sectorStats = useMemo(() => {
    const feats = filteredSetoresGeo.features.map((f) => f.properties);
    const total = feats.length;
    const fcuCount = feats.filter((p) => String(p.cd_tipo) === '1').length;
    const lowIncomeCount = feats.filter((p) => p.baixa_renda_1_5sm).length;
    const validIncome = feats.filter((p) => Number(p.renda_media_resp) > 0);
    const avgIevs = total
      ? feats.reduce((acc, p) => acc + Number(p.ievs_setor || 0), 0) / total
      : 0;
    const avgIncome = validIncome.length
      ? validIncome.reduce((acc, p) => acc + Number(p.renda_media_resp || 0), 0) / validIncome.length
      : 0;
    const fcuNames = Array.from(
      new Set(feats.map((p) => p.nm_fcu).filter((n) => n && !n.includes('Fora de FCU')))
    );
    return {
      total,
      fcuCount,
      fcuPct: total ? (fcuCount / total) * 100 : 0,
      lowIncomeCount,
      lowIncomePct: total ? (lowIncomeCount / total) * 100 : 0,
      avgIevs,
      avgIncome,
      fcuNames,
    };
  }, [filteredSetoresGeo]);

  function handleBasemapChange(next) {
    setBasemap(next);
    setLayerOpacity(next === 'satellite' ? 0.56 : 0.76);
  }

  function styleBairroFeature(feature) {
    const p = feature.properties;
    const isFoco = p.is_foco;
    const isBeiru = p.cd_bairro === '2927408018';
    const focusStroke = isBeiru ? '#fb7185' : '#38bdf8';

    if (granularity === 'setores_com_bairros') {
      return {
        fillColor: 'transparent',
        weight: 3,
        opacity: 0.95,
        color: focusStroke,
        fillOpacity: 0,
      };
    }

    return {
      fillColor: isFoco ? getSectorColor(p, theme) : appTheme === 'light' ? '#94a3b8' : '#334155',
      weight: isFoco ? 2.8 : 1.1,
      opacity: isFoco ? 1 : 0.7,
      color: isFoco ? focusStroke : appTheme === 'light' ? '#475569' : '#64748b',
      dashArray: isFoco ? '' : '4 4',
      fillOpacity: isFoco ? layerOpacity : appTheme === 'light' ? 0.16 : 0.22,
    };
  }

  function styleSetorFeature(feature) {
    const p = feature.properties;
    const activeSetorId = selectedSetorRef.current ?? selectedFeature?.cd_setor;
    const isSelected = Boolean(activeSetorId && activeSetorId === p.cd_setor);
    return {
      fillColor: getSectorColor(p, theme),
      weight: isSelected ? 2.8 : 0.85,
      opacity: 1,
      color: isSelected
        ? '#ffffff'
        : basemap === 'satellite'
          ? 'rgba(255, 255, 255, 0.52)'
          : appTheme === 'light'
            ? 'rgba(15, 23, 42, 0.38)'
            : 'rgba(15, 23, 42, 0.72)',
      fillOpacity: isSelected ? Math.min(0.95, layerOpacity + 0.14) : layerOpacity,
    };
  }

  function onEachSetor(feature, layer) {
    const p = feature.properties;
    const primaryMetric = formatPrimaryLayerMetric(p, theme);
    const isFcu = String(p.cd_tipo) === '1';

    layer.bindTooltip(
      `
      <div class="obs-tooltip-card">
        <div class="obs-tooltip-top">
          <span>Setor #${p.cd_setor.slice(-4)}</span>
          <span class="obs-tooltip-chip ${isFcu ? 'fcu' : 'reg'}">${isFcu ? 'FCU' : 'Regular'}</span>
        </div>
        <div class="obs-tooltip-bairro">${p.nm_bairro}</div>
        <div class="obs-tooltip-metric">
          <span>${primaryMetric.label}:</span>
          <strong>${primaryMetric.value}</strong>
        </div>
      </div>
      `,
      {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'obs-map-tooltip',
      }
    );

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2.6,
          color: '#ffffff',
          fillOpacity: Math.min(0.96, layerOpacity + 0.18),
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }
      },
      mouseout: (e) => {
        if (setoresLayerRef.current) {
          setoresLayerRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        setSelectedFeature({ type: 'SETOR', ...p });
      },
    });

    layer.bindPopup(`
      <div class="obs-popup-card">
        <div class="obs-popup-eyebrow">Setor Censitário Censo 2022</div>
        <div class="obs-popup-title">#${p.cd_setor} — ${p.nm_bairro}</div>
        <div class="obs-popup-badge ${isFcu ? 'is-fcu' : 'is-reg'}">
          ${p.tipologia_label} (${p.nm_fcu})
        </div>
        <table class="obs-popup-table">
          <tr><td>População (V0001)</td><td>${formatNumber(p.populacao)} hab</td></tr>
          <tr><td>Domicílios Ocup. (V0007)</td><td>${formatNumber(p.domicilios_ocupados)} dom</td></tr>
          <tr><td>Densidade</td><td>${formatNumber(p.densidade_hab_km2, 1)} hab/km²</td></tr>
          <tr><td>Renda Média (V06004)</td><td>${Number(p.renda_media_resp) > 0 ? formatCurrency(p.renda_media_resp) : 'Não divulgado'}</td></tr>
          <tr><td>Renda Mediana (V06006)</td><td>${Number(p.renda_mediana_resp) > 0 ? formatCurrency(p.renda_mediana_resp) : 'Não divulgado'}</td></tr>
          <tr class="is-highlight"><td>IEVS Setorial</td><td>${formatNumber(p.ievs_setor, 1)} / 100</td></tr>
        </table>
      </div>
    `);
  }

  function onEachBairro(feature, layer) {
    const p = feature.properties;
    if (granularity === 'setores_com_bairros') return;

    layer.bindTooltip(
      `
      <div class="obs-tooltip-card">
        <div class="obs-tooltip-top">
          <span>Bairro IBGE</span>
          <span class="obs-tooltip-chip ${p.is_foco ? 'fcu' : 'reg'}">${p.is_foco ? 'Foco AV3' : 'Entorno'}</span>
        </div>
        <div class="obs-tooltip-bairro">${p.nm_bairro}</div>
        <div class="obs-tooltip-metric">
          <span>População:</span>
          <strong>${formatNumber(p.populacao)} hab</strong>
        </div>
      </div>
      `,
      {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'obs-map-tooltip',
      }
    );

    layer.on({
      click: () => {
        setSelectedFeature({ type: 'BAIRRO', ...p });
      },
    });

    layer.bindPopup(`
      <div class="obs-popup-card">
        <div class="obs-popup-eyebrow">Bairro Oficial — Malha IBGE CD2022</div>
        <div class="obs-popup-title">${p.nm_bairro} (${p.cd_bairro})</div>
        <table class="obs-popup-table">
          <tr><td>População</td><td>${formatNumber(p.populacao)} hab</td></tr>
          <tr><td>Domicílios Totais</td><td>${formatNumber(p.domicilios_totais)}</td></tr>
          <tr><td>Área Territorial</td><td>${formatNumber(p.area_km2, 3)} km²</td></tr>
          <tr><td>Densidade</td><td>${formatNumber(p.densidade_hab_km2, 1)} hab/km²</td></tr>
          ${
            p.RENDA_MEDIA_RESP
              ? `<tr><td>Renda Média</td><td>${formatCurrency(p.RENDA_MEDIA_RESP)}</td></tr>
                 <tr class="is-highlight"><td>IEVS Base</td><td>${formatNumber(p.IEVS_EXPLORATORIO, 2)} / 100</td></tr>`
              : ''
          }
        </table>
      </div>
    `);
  }

  const canvasClass =
    basemap === 'satellite'
      ? 'basemap-satellite'
      : appTheme === 'light'
        ? 'basemap-osm-light'
        : 'basemap-osm-dark';

  const selectedIevs = selectedFeature?.ievs_setor ?? selectedFeature?.IEVS_EXPLORATORIO;
  const selectedIevsMeta = getIevsSeverity(selectedIevs);
  const selectedRenda = Number(selectedFeature?.renda_media_resp ?? selectedFeature?.RENDA_MEDIA_RESP ?? 0);
  const salvadorRenda = Number(ssaPerfil?.RENDA_MEDIA_RESP || 3160.73);
  const rendaVsSalvador = selectedRenda > 0 ? ((selectedRenda - salvadorRenda) / salvadorRenda) * 100 : null;

  return (
    <div className="screen-container">
      {/* Cabeçalho e Controles Estilo Painel Geográfico */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">Mapa Territorial Interativo · Malha Oficial IBGE Censo 2022</span>
            <h2 className="section-title">
              Cartografia de Bairros e 172 Setores Censitários (Beiru/Tancredo Neves e Pernambués)
            </h2>
          </div>

          <div className="territory-selector-group">
            <div className="btn-group-inline" role="group" aria-label="Enquadramento Territorial">
              <button
                type="button"
                className={`territory-pill ${focusArea === 'BOTH' ? 'active' : ''}`}
                onClick={() => setFocusArea('BOTH')}
              >
                <Compass size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />
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

            <button
              type="button"
              className={`action-toggle-btn ${showLayerDesc ? 'active' : ''}`}
              onClick={() => setShowLayerDesc((v) => !v)}
            >
              <Info size={14} />
              <span>{showLayerDesc ? 'Ocultar Nota da Camada' : 'Nota da Camada'}</span>
              {showLayerDesc ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Barra de Seleção Visual de Camadas e Granularidade */}
        <div className="map-layer-bar">
          <div className="map-layer-pills" role="group" aria-label="Camadas temáticas">
            <span className="map-bar-label">
              <Layers size={13} /> Camada:
            </span>
            {THEMATIC_LAYERS.map((layer) => {
              const IconComp = layer.icon;
              return (
                <button
                  key={layer.id}
                  type="button"
                  className={`map-layer-pill ${theme === layer.id ? 'active' : ''}`}
                  onClick={() => setTheme(layer.id)}
                >
                  <IconComp size={13} />
                  <span>{layer.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="map-granularity-toggle">
            <span className="map-bar-label">
              <Eye size={13} /> Escala:
            </span>
            <div className="btn-group-inline">
              <button
                type="button"
                className={`territory-pill ${granularity === 'setores_com_bairros' ? 'active' : ''}`}
                onClick={() => setGranularity('setores_com_bairros')}
              >
                Setores (172)
              </button>
              <button
                type="button"
                className={`territory-pill ${granularity === 'bairros' ? 'active' : ''}`}
                onClick={() => setGranularity('bairros')}
              >
                Bairros (13)
              </button>
            </div>
          </div>
        </div>

        {showLayerDesc && (
          <div className="methodology-banner" style={{ marginTop: 12 }}>
            <Info size={16} className="banner-icon" />
            <div>
              <strong>{activeLayerMeta.label}:</strong> {activeLayerMeta.description}
            </div>
          </div>
        )}
      </div>

      {/* Área Principal: Mapa com Controles Flutuantes + Painel Inspetor */}
      <div className="map-workspace-grid">
        <div className="map-canvas-card">
          <div className={`map-canvas-shell ${canvasClass}`}>
            {/* HUD Superior Direito sobre o Mapa: Mapa-Base, Opacidade, Rótulos e Recentralizar */}
            <div className="map-floating-hud">
              <div className="map-hud-group" title="Estilo do mapa-base">
                <button
                  type="button"
                  className={`map-hud-btn ${basemap === 'streets' ? 'active' : ''}`}
                  onClick={() => handleBasemapChange('streets')}
                >
                  <MapIcon size={13} /> Cartográfico
                </button>
                <button
                  type="button"
                  className={`map-hud-btn ${basemap === 'satellite' ? 'active' : ''}`}
                  onClick={() => handleBasemapChange('satellite')}
                >
                  <Satellite size={13} /> Satélite
                </button>
              </div>

              <div className="map-hud-group" title="Opacidade da camada temática">
                {[0.5, 0.76, 0.92].map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`map-hud-btn ${Math.abs(layerOpacity - op) < 0.05 ? 'active' : ''}`}
                    onClick={() => setLayerOpacity(op)}
                  >
                    {Math.round(op * 100)}%
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`map-hud-btn map-hud-solo ${showLabels ? 'active' : ''}`}
                onClick={() => setShowLabels((v) => !v)}
                title="Exibir ou ocultar rótulos de identificação dos bairros"
              >
                <Tag size={13} /> Rótulos
              </button>

              <button
                type="button"
                className="map-hud-btn map-hud-solo"
                onClick={() => setRecenterTick((t) => t + 1)}
                title="Ajustar zoom aos limites do recorte selecionado"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* HUD Inferior Esquerdo: Resumo Contextual Flutuante */}
            <div className="map-floating-summary">
              <span className="map-summary-badge">{activeLayerMeta.shortLabel}</span>
              <span className="map-summary-text">
                {sectorStats.total} setores · {sectorStats.fcuCount} em FCU ({formatNumber(sectorStats.fcuPct, 1)}%) · Passe o mouse ou clique
              </span>
            </div>

            <MapContainer
              center={fallbackViewport.center}
              zoom={fallbackViewport.zoom}
              style={{ height: '560px', width: '100%', borderRadius: '11px' }}
            >
              <MapViewportController
                boundsData={boundsData}
                fallbackViewport={fallbackViewport}
                recenterTick={recenterTick}
              />

              {basemap === 'streets' ? (
                <TileLayer
                  key="osm-streets"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · IBGE Censo 2022'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  key="esri-satellite"
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community · IBGE Censo 2022'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}

              {granularity === 'setores_com_bairros' && filteredSetoresGeo && (
                <GeoJSON
                  ref={setoresLayerRef}
                  key={`setores-${focusArea}-${theme}-${basemap}-${appTheme}-${layerOpacity}`}
                  data={filteredSetoresGeo}
                  style={styleSetorFeature}
                  onEachFeature={onEachSetor}
                />
              )}

              {visibleBairrosGeo && (
                <GeoJSON
                  key={`bairros-${granularity}-${focusArea}-${theme}-${appTheme}-${layerOpacity}`}
                  data={visibleBairrosGeo}
                  style={styleBairroFeature}
                  interactive={granularity !== 'setores_com_bairros'}
                  onEachFeature={onEachBairro}
                />
              )}

              {showLabels &&
                territoryLabels.map((lbl) => (
                  <Marker
                    key={`lbl-${lbl.code}-${lbl.isActive}`}
                    position={lbl.position}
                    icon={createTerritoryLabelIcon(lbl)}
                    eventHandlers={{
                      click: () => setFocusArea((prev) => (prev === lbl.code ? 'BOTH' : lbl.code)),
                    }}
                  />
                ))}
            </MapContainer>
          </div>

          <div className="map-legend-bar">
            <div className="legend-header-row">
              <strong>{activeLayerMeta.label}</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Base geográfica: Malha Setorial IBGE Censo 2022
              </span>
            </div>
            <div className="legend-items-row">
              {activeLayerMeta.legend.map((item, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-Swatch" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="legend-item">
                <span className="legend-Swatch-outline" style={{ borderColor: '#fb7185' }} />
                <span>Limite Beiru / Tancredo Neves</span>
              </div>
              <div className="legend-item">
                <span className="legend-Swatch-outline" style={{ borderColor: '#38bdf8' }} />
                <span>Limite Pernambués</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral Direito: Síntese dos Setores + Inspetor com Comparativo */}
        <div className="map-sidebar-card">
          <div className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span className="section-eyebrow">Síntese dos Setores Exibidos</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '0.96rem', fontWeight: 700 }}>
                  {sectorStats.total} Setores Censitários
                </h3>
              </div>
              <button
                type="button"
                className={`action-toggle-btn ${showFcuList ? 'active' : ''}`}
                onClick={() => setShowFcuList((v) => !v)}
                style={{ padding: '4px 9px', fontSize: '0.72rem' }}
              >
                <span>FCUs ({sectorStats.fcuNames.length})</span>
                {showFcuList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            <div className="mini-stat-grid">
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-rose)' }}>
                  {sectorStats.fcuCount} ({formatNumber(sectorStats.fcuPct, 1)}%)
                </span>
                <span className="mini-stat-lbl">Em Favelas/Comunidades Urbanas (FCU)</span>
              </div>
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-amber)' }}>
                  {sectorStats.lowIncomeCount} ({formatNumber(sectorStats.lowIncomePct, 1)}%)
                </span>
                <span className="mini-stat-lbl">Setores com Renda ≤ 1,5 SM</span>
              </div>
            </div>

            <div className="mini-stat-grid" style={{ marginBottom: 0 }}>
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-blue)' }}>
                  {formatNumber(sectorStats.avgIevs, 1)} pts
                </span>
                <span className="mini-stat-lbl">IEVS Médio dos Setores</span>
              </div>
              <div className="mini-stat-box">
                <span className="mini-stat-val" style={{ color: 'var(--accent-emerald)' }}>
                  {formatCurrency(sectorStats.avgIncome)}
                </span>
                <span className="mini-stat-lbl">Renda Média dos Setores Válidos</span>
              </div>
            </div>

            {showFcuList && (
              <div className="fcu-tags-box" style={{ marginTop: 10 }}>
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
            )}
          </div>

          <hr className="sidebar-divider" />

          <div className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-eyebrow">Inspeção de Feição</span>
              {selectedFeature && (
                <button
                  type="button"
                  className="action-toggle-btn"
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => setSelectedFeature(null)}
                >
                  <X size={12} /> Limpar
                </button>
              )}
            </div>

            {selectedFeature ? (
              <div className="feature-inspector">
                <h4>
                  {selectedFeature.type === 'SETOR'
                    ? `Setor #${selectedFeature.cd_setor}`
                    : `Bairro: ${selectedFeature.nm_bairro}`}
                </h4>
                <p className="inspector-sub">
                  {selectedFeature.type === 'SETOR'
                    ? `${selectedFeature.nm_bairro} · ${selectedFeature.tipologia_label}`
                    : `Código IBGE: ${selectedFeature.cd_bairro} · Subdistrito: ${selectedFeature.nm_subdist}`}
                </p>

                {selectedIevs !== undefined && (
                  <div className="ievs-meter-box">
                    <div className="ievs-meter-header">
                      <span>IEVS Exploratório</span>
                      <strong style={{ color: selectedIevsMeta.color }}>
                        {formatNumber(selectedIevs, 1)} / 100 ({selectedIevsMeta.label})
                      </strong>
                    </div>
                    <div className="ievs-meter-track">
                      <div
                        className="ievs-meter-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(selectedIevs)))}%`,
                          background: selectedIevsMeta.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="inspector-rows">
                  <div className="insp-row">
                    <span>População (V0001):</span>
                    <strong>{formatNumber(selectedFeature.populacao)} hab.</strong>
                  </div>
                  <div className="insp-row">
                    <span>Domicílios Ocup. (V0007):</span>
                    <strong>{formatNumber(selectedFeature.domicilios_ocupados)} dom.</strong>
                  </div>
                  <div className="insp-row">
                    <span>Área Oficial (AREA_KM2):</span>
                    <strong>{formatNumber(selectedFeature.area_km2, 4)} km²</strong>
                  </div>
                  <div className="insp-row">
                    <span>Densidade:</span>
                    <strong>{formatNumber(selectedFeature.densidade_hab_km2, 1)} hab/km²</strong>
                  </div>
                  <div className="insp-row">
                    <span>Moradores/Dom. (V0005):</span>
                    <strong>{formatNumber(selectedFeature.media_moradores, 2)}</strong>
                  </div>
                  {(selectedFeature.renda_media_resp !== undefined ||
                    selectedFeature.RENDA_MEDIA_RESP !== undefined) && (
                    <>
                      <div className="insp-row">
                        <span>Renda Média (V06004):</span>
                        <strong style={{ color: 'var(--accent-amber)' }}>
                          {selectedRenda > 0 ? formatCurrency(selectedRenda) : 'Não divulgado'}
                        </strong>
                      </div>
                      {rendaVsSalvador !== null && (
                        <div className="insp-row">
                          <span>Vs. Salvador (R$ 3.160,73):</span>
                          <strong style={{ color: rendaVsSalvador < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                            {rendaVsSalvador > 0 ? '+' : ''}
                            {formatNumber(rendaVsSalvador, 1)}%
                          </strong>
                        </div>
                      )}
                      <div className="insp-row">
                        <span>Renda Mediana (V06006):</span>
                        <strong>
                          {Number(selectedFeature.renda_mediana_resp ?? selectedFeature.RENDA_MEDIANA_RESP ?? 0) > 0
                            ? formatCurrency(selectedFeature.renda_mediana_resp ?? selectedFeature.RENDA_MEDIANA_RESP)
                            : 'Não divulgado'}
                        </strong>
                      </div>
                    </>
                  )}
                  {selectedFeature.nm_fcu && (
                    <div className="insp-row">
                      <span>Comunidade (NM_FCU):</span>
                      <strong>{selectedFeature.nm_fcu}</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-inspector">
                <MapPin size={22} style={{ color: 'var(--accent-blue)', marginBottom: 6 }} />
                <p>
                  Passe o mouse sobre qualquer setor para visualizar métricas instantâneas ou clique em um dos{' '}
                  <strong>172 Setores Censitários</strong> / <strong>Bairros</strong> para inspecionar todos os dados.
                </p>

                {beiruPerfil && pernPerfil && (
                  <div className="sidebar-quick-compare">
                    <div className="quick-compare-row">
                      <span className="quick-dot" style={{ background: '#fb7185' }} />
                      <span>Beiru / T. Neves</span>
                      <strong>IEVS {formatNumber(beiruPerfil.IEVS_EXPLORATORIO, 2)}</strong>
                    </div>
                    <div className="quick-compare-row">
                      <span className="quick-dot" style={{ background: '#38bdf8' }} />
                      <span>Pernambués</span>
                      <strong>IEVS {formatNumber(pernPerfil.IEVS_EXPLORATORIO, 2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
