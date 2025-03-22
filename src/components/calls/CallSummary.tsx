
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CallSummary: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Call Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium text-lg">32:35</div>
            <div className="text-sm text-muted-foreground">Total call time today</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-medium text-lg">5</div>
            <div className="text-sm text-muted-foreground">Completed calls</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-600 font-medium text-lg">2</div>
            <div className="text-sm text-muted-foreground">Missed calls</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-amber-600 font-medium text-lg">3</div>
            <div className="text-sm text-muted-foreground">Scheduled calls</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallSummary;
