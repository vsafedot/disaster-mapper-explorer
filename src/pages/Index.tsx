import React, { useState, useEffect } from 'react';
import DisasterMap from '@/components/DisasterMap';
import DisasterList from '@/components/DisasterList';
import Filters from '@/components/Filters';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Menu, ExternalLink, PhoneCall, AlertTriangle, BarChart3, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['earthquake', 'flood', 'fire', 'weather']);
  const [severity, setSeverity] = useState(3);
  const [timeRange, setTimeRange] = useState(24);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const getEmergencyContacts = () => [
    { name: 'Emergency Services', number: '911', type: 'Emergency' },
    { name: 'FEMA', number: '1-800-621-3362', type: 'Federal' },
    { name: 'Red Cross', number: '1-800-733-2767', type: 'Aid' },
    { name: 'Poison Control', number: '1-800-222-1222', type: 'Medical' },
  ];

  const getSafetyTips = () => [
    { type: 'Earthquake', tip: 'Drop, Cover, and Hold On. Stay away from windows.' },
    { type: 'Flood', tip: 'Move to higher ground. Avoid walking through flowing water.' },
    { type: 'Fire', tip: 'Have an evacuation plan. Keep low to avoid smoke inhalation.' },
    { type: 'Weather', tip: 'Stay informed about conditions. Have emergency supplies ready.' },
  ];

  const getDisasterStats = () => {
    const activeDisasters = disasters.length;
    const severityCount = disasters.reduce((acc, disaster) => {
      acc[disaster.severity] = (acc[disaster.severity] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total: activeDisasters,
      highSeverity: disasters.filter(d => d.severity >= 4).length,
      recentEvents: disasters.filter(d => {
        const hoursSince = (Date.now() - new Date(d.timestamp).getTime()) / (1000 * 60 * 60);
        return hoursSince <= 6;
      }).length,
      byType: disasters.reduce((acc, disaster) => {
        acc[disaster.type] = (acc[disaster.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const stats = getDisasterStats();

  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      try {
        const earthquakeRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        const earthquakeData = await earthquakeRes.json();
        
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
    const verificationLink = getVerificationLink(disaster);
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
          <a
            href={verificationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-2"
          >
            Verify Details
            <ExternalLink className="h-4 w-4" />
          </a>
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

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {getEmergencyContacts().map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <Badge variant="outline">{contact.type}</Badge>
                    </div>
                    <a
                      href={`tel:${contact.number}`}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      {contact.number}
                      <PhoneCall className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentEvents} in the last 6 hours
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.highSeverity}
              </div>
              <p className="text-xs text-muted-foreground">
                Level 4-5 incidents
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Active Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(stats.byType).length > 0
                  ? Object.entries(stats.byType).reduce((a, b) => 
                      a[1] > b[1] ? a : b
                    )[0]
                  : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alert Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {stats.highSeverity > 5 ? "High" : stats.highSeverity > 2 ? "Moderate" : "Low"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DisasterMap
          disasters={disasters}
          onMarkerClick={handleDisasterSelect}
          isLoading={loading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DisasterList
            disasters={disasters}
            onDisasterSelect={handleDisasterSelect}
          />

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {getSafetyTips().map((tip, index) => (
                    <div key={index} className="p-4 rounded-lg bg-secondary/50">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {tip.type}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tip.tip}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
