
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface FiltersProps {
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
  severity: number;
  onSeverityChange: (value: number) => void;
  timeRange: number;
  onTimeRangeChange: (hours: number) => void;
}

const Filters = ({
  selectedTypes,
  onTypeChange,
  severity,
  onSeverityChange,
  timeRange,
  onTimeRangeChange
}: FiltersProps) => {
  const disasterTypes = [
    { id: 'earthquake', label: '🌋 Earthquakes' },
    { id: 'flood', label: '🌊 Floods' },
    { id: 'fire', label: '🔥 Fires' },
    { id: 'volcano', label: '🗻 Volcanoes' },
    { id: 'weather', label: '⛈️ Weather' }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Disaster Types</Label>
          <div className="flex flex-wrap gap-2">
            {disasterTypes.map((type) => (
              <Toggle
                key={type.id}
                pressed={selectedTypes.includes(type.id)}
                onPressedChange={() => onTypeChange(type.id)}
                className={`disaster-type-${type.id}`}
              >
                {type.label}
              </Toggle>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Minimum Severity</Label>
          <Slider
            value={[severity]}
            onValueChange={(value) => onSeverityChange(value[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <Label>Time Range</Label>
          <div className="flex gap-2">
            {[24, 48, 168].map((hours) => (
              <Button
                key={hours}
                variant={timeRange === hours ? "default" : "outline"}
                onClick={() => onTimeRangeChange(hours)}
                className="flex-1"
              >
                {hours === 168 ? '7 Days' : `${hours}h`}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Filters;
