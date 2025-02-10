
import React, { useState, useEffect } from 'react';
import DisasterMap from '@/components/DisasterMap';
import DisasterList from '@/components/DisasterList';
import Filters from '@/components/Filters';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['earthquake', 'flood', 'fire']);
  const [severity, setSeverity] = useState(3);
  const [timeRange, setTimeRange] = useState(24);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      try {
        // Fetch earthquake data from USGS
        const earthquakeRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        const earthquakeData = await earthquakeRes.json();
        
        // Fetch weather alerts from weather.gov
        const weatherRes = await fetch('https://api.weather.gov/alerts/active');
        const weatherData = await weatherRes.json();

        // Process and combine the data
        const processedDisasters = [
          ...earthquakeData.features.map((eq: any) => ({
            id: eq.id,
            type: 'Earthquake',
            severity: Math.round(eq.properties.mag),
            latitude: eq.geometry.coordinates[1],
            longitude: eq.geometry.coordinates[0],
            location: eq.properties.place,
            timestamp: new Date(eq.properties.time).toISOString(),
            description: `Magnitude ${eq.properties.mag} earthquake detected at depth ${eq.geometry.coordinates[2]}km`
          })),
          ...weatherData.features.map((alert: any) => ({
            id: alert.id,
            type: 'Weather',
            severity: alert.properties.severity === 'Extreme' ? 5 : 
                     alert.properties.severity === 'Severe' ? 4 : 3,
            latitude: alert.geometry.coordinates[1],
            longitude: alert.geometry.coordinates[0],
            location: alert.properties.areaDesc,
            timestamp: new Date(alert.properties.sent).toISOString(),
            description: alert.properties.headline,
            forecast: alert.properties.description
          }))
        ];

        setDisasters(processedDisasters);
        toast({
          title: "Data Updated",
          description: "Latest disaster information loaded successfully.",
        });
      } catch (error) {
        console.error('Error fetching disaster data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch disaster data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
    const interval = setInterval(fetchDisasters, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, [selectedTypes, severity, timeRange]);

  const handleDisasterSelect = (disaster: any) => {
    // Fetch detailed weather forecast for the selected location
    const fetchForecast = async () => {
      try {
        const forecastRes = await fetch(
          `https://api.weather.gov/points/${disaster.latitude},${disaster.longitude}`
        );
        const pointData = await forecastRes.json();
        const forecastRes2 = await fetch(pointData.properties.forecast);
        const forecastData = await forecastRes2.json();
        
        toast({
          title: `${disaster.type} Details`,
          description: (
            <div>
              <p>{disaster.description}</p>
              {forecastData.properties.periods[0] && (
                <p className="mt-2">
                  <strong>Weather Forecast:</strong> {forecastData.properties.periods[0].detailedForecast}
                </p>
              )}
            </div>
          ),
        });
      } catch (error) {
        toast({
          title: `${disaster.type} Details`,
          description: disaster.description,
        });
      }
    };

    fetchForecast();
  };

  return (
    <div className="flex min-h-screen bg-background p-4 gap-4">
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        } transition-all duration-300 ease-in-out flex flex-col gap-4`}
      >
        <Filters
          selectedTypes={selectedTypes}
          onTypeChange={(type) => {
            setSelectedTypes(prev =>
              prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
            );
          }}
          severity={severity}
          onSeverityChange={setSeverity}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Global Disaster Response System</h1>
        </div>
        
        <DisasterMap
          disasters={disasters}
          onMarkerClick={handleDisasterSelect}
          isLoading={loading}
        />
        
        <DisasterList
          disasters={disasters}
          onDisasterSelect={handleDisasterSelect}
        />
      </div>
    </div>
  );
};

export default Index;
