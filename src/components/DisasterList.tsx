
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Disaster {
  id: string;
  type: string;
  severity: number;
  location: string;
  timestamp: string;
  description: string;
}

interface DisasterListProps {
  disasters: Disaster[];
  onDisasterSelect: (disaster: Disaster) => void;
}

const DisasterList = ({ disasters, onDisasterSelect }: DisasterListProps) => {
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'bg-red-500/10 text-red-500';
      case 4: return 'bg-orange-500/10 text-orange-500';
      case 3: return 'bg-yellow-500/10 text-yellow-500';
      case 2: return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-green-500/10 text-green-500';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {disasters.map((disaster) => (
            <div
              key={disaster.id}
              className="p-4 mb-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer"
              onClick={() => onDisasterSelect(disaster)}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={`disaster-type-${disaster.type.toLowerCase()}`}>
                  {disaster.type}
                </Badge>
                <Badge className={getSeverityColor(disaster.severity)}>
                  Severity {disaster.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{disaster.location}</p>
              <p className="text-xs text-muted-foreground">{disaster.timestamp}</p>
              <p className="mt-2 text-sm line-clamp-2">{disaster.description}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DisasterList;
