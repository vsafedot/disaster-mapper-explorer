
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Disaster {
  id: string;
  type: string;
  severity: number;
  location: string;
  timestamp: string;
  description: string;
  forecast?: string;
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

  const getTimeStatus = (timestamp: string) => {
    const hoursSince = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 1) return { text: 'Just now', color: 'text-green-500' };
    if (hoursSince < 6) return { text: 'Recent', color: 'text-blue-500' };
    if (hoursSince < 24) return { text: 'Today', color: 'text-yellow-500' };
    return { text: 'Older', color: 'text-gray-500' };
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Incidents</CardTitle>
        <Badge variant="secondary">
          {disasters.length} Events
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {disasters.map((disaster) => {
            const timeStatus = getTimeStatus(disaster.timestamp);
            return (
              <div
                key={disaster.id}
                className="p-4 mb-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer group"
                onClick={() => onDisasterSelect(disaster)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`disaster-type-${disaster.type.toLowerCase()}`}>
                    {disaster.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(disaster.severity)}>
                      Severity {disaster.severity}
                    </Badge>
                    <span className={`text-xs ${timeStatus.color}`}>
                      {timeStatus.text}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{disaster.location}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(disaster.timestamp).toLocaleString()}
                </p>
                <p className="mt-2 text-sm line-clamp-2 group-hover:line-clamp-none transition-all">
                  {disaster.description}
                </p>
                {disaster.forecast && (
                  <div className="mt-2 p-2 bg-amber-500/10 rounded-md">
                    <p className="text-sm text-amber-500">
                      <strong>Forecast:</strong> {disaster.forecast}
                    </p>
                  </div>
                )}
                <div className="mt-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View Details <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            )
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DisasterList;
