import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Info, MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DisasterMapProps {
  disasters: any[];
  onMarkerClick: (disaster: any) => void;
  isLoading?: boolean;
}

const DisasterMap = ({ disasters, onMarkerClick, isLoading = false }: DisasterMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredDisaster, setHoveredDisaster] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [safeLocation, setSafeLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const safeMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();

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

    mapboxgl.accessToken = 'dummy-token';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: openStreetMapStyle,
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    map.current.on('load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(15, 15, 15)',
          'high-color': 'rgb(25, 25, 25)',
          'horizon-blend': 0.2
        });
        setMapLoaded(true);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const trackUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(newLocation);

          if (map.current) {
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }

            const el = document.createElement('div');
            el.className = 'flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg';
            el.innerHTML = '<div class="text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><point cx="12" cy="12"/></svg></div>';

            userMarkerRef.current = new mapboxgl.Marker(el)
              .setLngLat(newLocation)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML('<strong>Your Location</strong>')
              )
              .addTo(map.current);

            map.current.flyTo({
              center: newLocation,
              zoom: 10,
              duration: 2000
            });

            toast({
              title: "Location Updated",
              description: "Your current location has been detected and the map has been centered to your position.",
            });
          }
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to get your location. Please check your browser permissions.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation Unavailable",
        description: "Your browser doesn't support geolocation.",
      });
    }
  };

  const markSafeLocation = () => {
    if (!map.current) return;

    const center = map.current.getCenter();
    const newSafeLocation: [number, number] = [center.lng, center.lat];
    setSafeLocation(newSafeLocation);

    if (safeMarkerRef.current) {
      safeMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'flex items-center justify-center w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg';
    el.innerHTML = '<div class="text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div>';

    safeMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat(newSafeLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<strong>Safe Location</strong><p>Center of current map view</p>')
      )
      .addTo(map.current);

    toast({
      title: "Safe Location Marked",
      description: "The center of the current map view has been marked as a safe location.",
    });
  };

  const getVerificationLink = (disaster: any) => {
    const baseLinks: { [key: string]: string } = {
      Earthquake: `https://earthquake.usgs.gov/earthquakes/map/?extent=${disaster.latitude},${disaster.longitude}`,
      Weather: `https://www.weather.gov/warnings`,
      Flood: 'https://water.weather.gov/ahps/',
      Fire: 'https://www.fireweatheravalanche.org/fire/',
      Volcano: 'https://www.usgs.gov/programs/VHP'
    };
    return baseLinks[disaster.type] || '#';
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const getTimeStatus = (timestamp: string) => {
    const hoursSince = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 1) return { text: 'Just now', color: 'text-green-500' };
    if (hoursSince < 6) return { text: 'Recent', color: 'text-blue-500' };
    if (hoursSince < 24) return { text: 'Today', color: 'text-yellow-500' };
    return { text: 'Older', color: 'text-gray-500' };
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return;

    clearMarkers();

    disasters.forEach((disaster) => {
      if (!map.current) return;

      const el = document.createElement('div');
      el.className = `disaster-type disaster-type-${disaster.type.toLowerCase()} ${getSeverityColor(disaster.severity)} cursor-pointer transition-transform hover:scale-110`;
      el.textContent = getDisasterEmoji(disaster.type);
      
      el.addEventListener('mouseenter', () => setHoveredDisaster(disaster));
      el.addEventListener('mouseleave', () => setHoveredDisaster(null));
      
      const verificationLink = getVerificationLink(disaster);
      const timeStatus = getTimeStatus(disaster.timestamp);
      const popupContent = `
        <div class="p-4 max-w-xs">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-lg">${disaster.type} Alert</h3>
            <span class="${timeStatus.color}">${timeStatus.text}</span>
          </div>
          <div class="mb-3 flex items-center gap-2">
            <span class="px-2 py-1 rounded-full text-xs ${getSeverityColor(disaster.severity)} text-white">
              Severity ${disaster.severity}/5
            </span>
            <span class="text-sm text-muted-foreground">${disaster.location}</span>
          </div>
          <p class="mb-2 text-sm">${disaster.description}</p>
          ${disaster.forecast ? 
            `<div class="mb-2 p-2 bg-amber-500/10 rounded-md">
              <p class="text-sm text-amber-500"><strong>Forecast:</strong> ${disaster.forecast}</p>
            </div>` 
            : ''
          }
          <div class="flex items-center justify-between mt-3 pt-2 border-t">
            <span class="text-xs text-muted-foreground">
              ${new Date(disaster.timestamp).toLocaleString()}
            </span>
            <a href="${verificationLink}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
              Verify Details 
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([disaster.longitude, disaster.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(popupContent)
        )
        .addTo(map.current);

      el.addEventListener('click', () => {
        onMarkerClick(disaster);
        marker.togglePopup();
      });

      markersRef.current.push(marker);
    });
  }, [disasters, mapLoaded, isLoading, onMarkerClick]);

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
      <CardHeader className="absolute top-0 left-0 z-10 bg-background/80 backdrop-blur-sm w-full">
        <div className="flex items-center justify-between">
          <CardTitle>Live Disaster Map</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={trackUserLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Track Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markSafeLocation}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Mark Safe Location
            </Button>
            {disasters.length > 0 && (
              <Badge variant="secondary">
                {disasters.length} Active Events
              </Badge>
            )}
            <div className="relative group">
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
              <div className="absolute hidden group-hover:block right-0 top-6 w-64 p-2 bg-popover text-popover-foreground rounded-md shadow-lg text-sm">
                Click on markers to see detailed information. Use the buttons to track your location or mark safe points.
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative h-full">
        <div ref={mapContainer} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {hoveredDisaster && (
          <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-semibold">{hoveredDisaster.type} - {hoveredDisaster.location}</h4>
            <p className="text-sm text-muted-foreground">{hoveredDisaster.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
