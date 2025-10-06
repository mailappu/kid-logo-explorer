import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const MigrateLogos = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('migrate-logos');

      if (error) throw error;

      setResult(data);
      toast({
        title: "Migration Complete!",
        description: `${data.successCount} logos migrated successfully`,
      });
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Logo Migration Tool</h2>
      <p className="mb-6 text-muted-foreground">
        This will download all airline logos from Wikipedia and upload them to secure storage.
        This only needs to be run once.
      </p>

      <Button
        onClick={handleMigration}
        disabled={isMigrating}
        size="lg"
        className="w-full"
      >
        {isMigrating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Migrating Logos...
          </>
        ) : (
          "Start Migration"
        )}
      </Button>

      {result && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Migration Results:</h3>
          <p className="text-sm">Total Processed: {result.totalProcessed}</p>
          <p className="text-sm text-green-600">Success: {result.successCount}</p>
          <p className="text-sm text-red-600">Failed: {result.failedCount}</p>
          
          {result.results && result.results.length > 0 && (
            <div className="mt-4 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2">Details:</h4>
              {result.results.map((r: any, i: number) => (
                <div key={i} className="text-xs mb-1 p-2 bg-background rounded">
                  <span className={r.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {r.status === 'success' ? '✓' : '✗'}
                  </span>
                  {' '}{r.name}
                  {r.error && <span className="text-red-600"> - {r.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
