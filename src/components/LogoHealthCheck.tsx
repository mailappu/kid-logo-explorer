import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoStatus {
  name: string;
  url: string;
  status: 'checking' | 'success' | 'failed';
  error?: string;
}

export const LogoHealthCheck = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<LogoStatus[]>([]);
  const { toast } = useToast();

  const checkImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  };

  const runHealthCheck = async () => {
    setChecking(true);
    setResults([]);

    try {
      // Fetch all logos from database
      const { data: logos, error } = await supabase
        .from('logo_items')
        .select('name, logo_image_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      if (!logos || logos.length === 0) {
        toast({
          title: "No logos found",
          description: "Database contains no active logos",
          variant: "destructive",
        });
        return;
      }

      // Initialize results with checking status
      const initialResults: LogoStatus[] = logos.map(logo => ({
        name: logo.name,
        url: logo.logo_image_url,
        status: 'checking' as const,
      }));
      setResults(initialResults);

      // Check each logo
      const checkPromises = logos.map(async (logo, index) => {
        const isValid = await checkImageLoad(logo.logo_image_url);
        
        setResults(prev => {
          const updated = [...prev];
          updated[index] = {
            name: logo.name,
            url: logo.logo_image_url,
            status: isValid ? 'success' : 'failed',
            error: isValid ? undefined : 'Failed to load image',
          };
          return updated;
        });
      });

      await Promise.all(checkPromises);

      // Show summary toast
      const failed = initialResults.filter((_, i) => 
        results[i]?.status === 'failed'
      ).length;
      
      toast({
        title: failed === 0 ? "All logos healthy!" : `Found ${failed} corrupted logos`,
        description: `Checked ${logos.length} logos total`,
        variant: failed === 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error("Health check error:", error);
      toast({
        title: "Health Check Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const checkingCount = results.filter(r => r.status === 'checking').length;

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Logo Health Check</h2>
      <p className="mb-6 text-muted-foreground">
        Check all {results.length || '101'} airline logos for corruption or loading issues.
      </p>

      <Button
        onClick={runHealthCheck}
        disabled={checking}
        size="lg"
        className="w-full mb-6"
      >
        {checking ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Checking Logos... ({successCount + failedCount}/{results.length})
          </>
        ) : (
          "Run Health Check"
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{successCount}</div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{failedCount}</div>
              <div className="text-sm text-muted-foreground">Corrupted</div>
            </div>
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{checkingCount}</div>
              <div className="text-sm text-muted-foreground">Checking</div>
            </div>
          </div>

          {/* Failed logos first */}
          {failedCount > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-600">⚠️ Corrupted Logos ({failedCount})</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {results
                  .filter(r => r.status === 'failed')
                  .map((result, i) => (
                    <div key={i} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{result.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.url}</div>
                          {result.error && <div className="text-xs text-red-600 mt-1">{result.error}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Success logos (collapsed by default) */}
          {successCount > 0 && (
            <details className="space-y-2">
              <summary className="font-semibold text-green-600 cursor-pointer">
                ✅ Healthy Logos ({successCount})
              </summary>
              <div className="max-h-64 overflow-y-auto space-y-1 mt-2">
                {results
                  .filter(r => r.status === 'success')
                  .map((result, i) => (
                    <div key={i} className="p-2 bg-green-50 dark:bg-green-950 rounded flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{result.name}</span>
                    </div>
                  ))}
              </div>
            </details>
          )}

          {/* Still checking */}
          {checkingCount > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-600">⏳ Checking... ({checkingCount})</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {results
                  .filter(r => r.status === 'checking')
                  .map((result, i) => (
                    <div key={i} className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-yellow-600 animate-spin flex-shrink-0" />
                      <span className="text-sm">{result.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
