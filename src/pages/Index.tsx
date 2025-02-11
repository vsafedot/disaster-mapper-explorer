
import React, { useState, useEffect } from 'react';
import DisasterMap from '@/components/DisasterMap';
import DisasterList from '@/components/DisasterList';
import Filters from '@/components/Filters';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['earthquake', 'flood', 'fire', 'weather']);
  const [severity, setSeverity] = useState(3);
  const [timeRange, setTimeRange] = useState(24);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      try {
        // Fetch earthquake data from USGS (open data)
        const earthquakeRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        const earthquakeData = await earthquakeRes.json();
        
        // Mock weather data (since we're not using weather.gov API)
        const mockWeatherEvents = [
          {
            id: 'w1',
            type: 'Weather',
            severity: 4,
            latitude: 40.7128,
            longitude: -74.0060,
            location: 'New York, USA',
            timestamp: new Date().toISOString(),
            description: 'Heavy thunderstorms expected',
            forecast: 'Strong winds and heavy rainfall predicted for the next 24 hours'
          },
          {
            id: 'w2',
            type: 'Weather',
            severity: 3,
            latitude: 51.5074,
            longitude: -0.1278,
            location: 'London, UK',
            timestamp: new Date().toISOString(),
            description: 'Severe wind warning',
            forecast: 'High-speed winds expected with possible disruption to travel'
          }
        ];

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
          ...mockWeatherEvents
        ];

        // Filter disasters based on selected types and severity
        const filteredDisasters = processedDisasters.filter(disaster => {
          const typeMatch = selectedTypes.includes(disaster.type.toLowerCase());
          const severityMatch = disaster.severity >= severity;
          const timeMatch = new Date(disaster.timestamp) >= new Date(Date.now() - timeRange * 60 * 60 * 1000);
          return typeMatch && severityMatch && timeMatch;
        });

        setDisasters(filteredDisasters);
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
    toast({
      title: `${disaster.type} Alert - ${disaster.location}`,
      description: (
        <div className="space-y-2">
          <p><strong>Time:</strong> {new Date(disaster.timestamp).toLocaleString()}</p>
          <p><strong>Severity:</strong> {disaster.severity}/5</p>
          <p>{disaster.description}</p>
          {disaster.forecast && (
            <p className="text-amber-500">
              <strong>Forecast:</strong> {disaster.forecast}
            </p>
          )}
        </div>
      ),
      duration: 5000,
    });
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

