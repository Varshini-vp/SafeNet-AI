import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Filter, AlertTriangle, Layers, Radio, RefreshCw, Gauge } from 'lucide-react';
import { riskAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import L from 'leaflet';

const RiskHotspotsMapPage = () => {
  const [hotspots, setHotspots] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const res = await riskAPI.getHotspots(activeFilter);
      if (res.data.success) {
        setHotspots(res.data.hotspots);
        if (res.data.hotspots.length > 0 && !selectedHotspot) {
          setSelectedHotspot(res.data.hotspots[0]);
        }
      }
    } catch (e) {
      console.warn('Hotspots fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, [activeFilter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090],
        zoom: 12,
        zoomControl: true
      });

      // Dark CartoDB tile layer for command center aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers for current hotspots
    hotspots.forEach((spot) => {
      const isHigh = spot.riskLevel === 'HIGH';
      const isMed = spot.riskLevel === 'MEDIUM';

      const color = isHigh ? '#ef4444' : (isMed ? '#f59e0b' : '#10b981');
      const pulseClass = isHigh ? 'animate-ping' : '';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${color}; opacity: 0.3;" class="${pulseClass}"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedHotspot(spot);
      });

      markersRef.current.push(marker);
    });

    // Invalidate map size after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [hotspots]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Geographic Risk Hotspots (Leaflet / OSM)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial collision heatmaps and high-incident clusters correlated with connected smart CCTV telemetry.
          </p>
        </div>

        <button
          onClick={fetchHotspots}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b border-slate-800 pb-3">
        {[
          { id: 'ALL', label: 'All Hotspots' },
          { id: 'HIGH', label: 'High Risk Zones' },
          { id: 'MEDIUM', label: 'Medium Risk' },
          { id: 'LOW', label: 'Low Risk' },
          { id: 'OVERSPEEDING', label: 'Overspeeding Hotspots' },
          { id: 'WRONG_WAY', label: 'Wrong-Way Corridors' },
          { id: 'PROXIMITY', label: 'Tailgating Clusters' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveFilter(btn.id)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeFilter === btn.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Map + Hotspot Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Leaflet Map */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative h-[520px] bg-[#0c121e]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay HUD */}
          <div className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1 backdrop-blur shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-bold">High Incident Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-400">Moderate Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">Safe Operational</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Selected Hotspot Details Drawer */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
          {selectedHotspot ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  CCTV NODE {selectedHotspot.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedHotspot.cameraName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedHotspot.location}</p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Risk Severity:</span>
                  <RiskBadge level={selectedHotspot.riskLevel} score={selectedHotspot.averageRiskScore} />
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Total Incidents:</span>
                  <span className="text-white font-bold">{selectedHotspot.incidentCount} logged</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Dominant Hazard:</span>
                  <span className="text-red-400 font-bold">{selectedHotspot.dominantRiskType?.replace(/_/g, ' ')}</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Corridor Density:</span>
                  <span className="text-cyan-400 font-bold">{selectedHotspot.trafficDensity}%</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Configured Speed Limit:</span>
                  <span className="text-slate-200 font-bold">{selectedHotspot.speedLimit} km/h</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Latest Registered Alert:</span>
                  <p className="text-white font-bold">{selectedHotspot.latestAlert}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs">
              Select a map marker to view zone details.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500">
            Clicking any hotspot pin centers intelligence telemetry.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskHotspotsMapPage;
