'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Search, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (coords: LatLng, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPickerDialog({ open, onClose, onConfirm, initialLat, initialLng }: Props) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const leafletMap   = useRef<any>(null);
  const markerRef    = useRef<any>(null);
  const autoLocatedRef = useRef(false);
  const [coords,     setCoords]     = useState<LatLng>({ lat: initialLat ?? 17.9667, lng: initialLng ?? 102.6133 });
  const [address,    setAddress]    = useState('');
  const [searching,  setSearching]  = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [locating,   setLocating]   = useState(false);
  const [mapReady,   setMapReady]   = useState(false);

  useEffect(() => {
    if (!open) return;
    const lat = initialLat ?? 17.9667;
    const lng = initialLng ?? 102.6133;
    setCoords({ lat, lng });
    setAddress('');
    setSearchVal('');
    autoLocatedRef.current = false;
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('leaflet-styles')) return;

    const link = document.createElement('link');
    link.id = 'leaflet-styles';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      if (data?.display_name) setAddress(data.display_name);
    } catch { /* silent */ }
  }, []);

  // ── Init Leaflet ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    // small delay so dialog is mounted
    const timer = setTimeout(async () => {
      if (!mapRef.current || leafletMap.current) return;

      const L = (await import('leaflet')).default;
    //   await import('leaflet/dist/leaflet.css');

      // fix default icon path issue with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initLat = initialLat ?? 17.9667;
      const initLng = initialLng ?? 102.6133;

      const map = L.map(mapRef.current!).setView([initLat, initLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Custom teal marker
      const tealIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;
          background:linear-gradient(135deg,#14b8a6,#10b981);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        className:  '',
      });

      const marker = L.marker([initLat, initLng], { icon: tealIcon, draggable: true }).addTo(map);
      markerRef.current = marker;
      leafletMap.current = map;
      setMapReady(true);

      // click on map → move marker
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lng.toFixed(7)) });
        reverseGeocode(lat, lng);
      });

      // drag marker
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        setCoords({ lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lng.toFixed(7)) });
        reverseGeocode(lat, lng);
      });

      // initial reverse geocode
      reverseGeocode(initLat, initLng);
    }, 100);

    return () => clearTimeout(timer);
  }, [open, initialLat, initialLng, reverseGeocode]);

  // cleanup on close
  useEffect(() => {
    if (!open && leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
      markerRef.current  = null;
      setMapReady(false);
    }
  }, [open]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchVal.trim() || !leafletMap.current) return;
    setSearching(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchVal)}&format=json&limit=1`);
      const data = await res.json();
      if (data?.[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        leafletMap.current.setView([lat, lng], 15);
        markerRef.current?.setLatLng([lat, lng]);
        setCoords({ lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lng.toFixed(7)) });
        setAddress(data[0].display_name);
      }
    } catch { /* silent */ }
    finally { setSearching(false); }
  };

  // ── Get current location ──────────────────────────────────────────────────
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        leafletMap.current?.setView([lat, lng], 16);
        markerRef.current?.setLatLng([lat, lng]);
        setCoords({ lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lng.toFixed(7)) });
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      () => setLocating(false)
    );
  }, [reverseGeocode]);

  // Default to the device's current location when no initial coords are provided.
  useEffect(() => {
    const hasInitial = typeof initialLat === 'number' && typeof initialLng === 'number';
    if (!open || !mapReady || hasInitial || autoLocatedRef.current) return;
    autoLocatedRef.current = true;
    handleLocate();
  }, [open, mapReady, initialLat, initialLng, handleLocate]);

  const handleConfirm = () => {
    onConfirm(coords, address);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Pick Location on Map</p>
                  <p className="text-xs text-muted-foreground">Click anywhere or drag the pin</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 pt-3 pb-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a place..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleSearch} disabled={searching} className="h-9 px-3">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={handleLocate} disabled={locating}
                className="h-9 px-3" title="Use my location">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              </Button>
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1 min-h-[360px]" style={{ zIndex: 1 }} />

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              {/* Coords display */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-xs font-mono">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="text-muted-foreground">Lat:</span>
                  <span className="font-semibold">{coords.lat.toFixed(6)}</span>
                  <span className="text-muted-foreground ml-2">Lng:</span>
                  <span className="font-semibold">{coords.lng.toFixed(6)}</span>
                </div>
              </div>
              {address && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  📍 {address}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-9" onClick={onClose}>Cancel</Button>
                <Button
                  className="flex-1 h-9 bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                  onClick={handleConfirm}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Confirm Location
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
