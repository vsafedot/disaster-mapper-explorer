
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

  // Mock data fetching - replace with real API calls
  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockDisasters = [
          {
            id: '1',
            type: 'Earthquake',
            severity: 4,
            latitude: 35.6762,
            longitude: 139.6503,
            location: 'Tokyo, Japan',
            timestamp: new Date().toISOString(),
            description: 'Magnitude 6.5 earthquake detected'
          },
          // Add more mock disasters here
        ];
        
        setDisasters(mockDisasters);
        toast({
          title: "Data Updated",
          description: "Latest disaster information loaded successfully.",
        });
      } catch (error) {
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
      title: `${disaster.type} Details`,
      description: disaster.description,
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
