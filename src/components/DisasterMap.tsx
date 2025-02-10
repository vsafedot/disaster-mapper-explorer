
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DisasterMapProps {
  disasters: any[];
  onMarkerClick: (disaster: any) => void;
  isLoading?: boolean;
}

const DisasterMap = ({ disasters, onMarkerClick, isLoading = false }: DisasterMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const openStreetMapStyle = {
      version: 8 as const,
      sources: {
        'osm': {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors'
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster' as const,
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    mapboxgl.accessToken = 'placeholder';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: openStreetMapStyle,
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(15, 15, 15)',
        'high-color': 'rgb(25, 25, 25)',
        'horizon-blend': 0.2
      });
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    disasters.forEach((disaster) => {
      const el = document.createElement('div');
      el.className = `disaster-type disaster-type-${disaster.type.toLowerCase()}`;
      el.textContent = getDisasterEmoji(disaster.type);
      
      new mapboxgl.Marker(el)
        .setLngLat([disaster.longitude, disaster.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${disaster.type}</h3>
                <p>Severity: ${disaster.severity}</p>
                <p>${disaster.description}</p>
                ${disaster.forecast ? `<p class="mt-2 font-semibold">Forecast: ${disaster.forecast}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);
        
      el.addEventListener('click', () => onMarkerClick(disaster));
    });
  }, [disasters, mapLoaded, isLoading]);

  const getDisasterEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      Earthquake: '🌋',
      Flood: '🌊',
      Fire: '🔥',
      Volcano: '🗻',
      Weather: '⛈️'
    };
    return emojis[type] || '⚠️';
  };

  return (
    <Card className="w-full h-[600px] overflow-hidden glass-card">
      <CardHeader className="absolute top-0 left-0 z-10 bg-transparent">
        <CardTitle>Live Disaster Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative h-full">
        <div ref={mapContainer} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
