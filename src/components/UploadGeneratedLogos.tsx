import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Import generated logos
import emiratesLogo from "@/assets/temp-logos/emirates.png";
import qatarLogo from "@/assets/temp-logos/qatar.png";
import singaporeLogo from "@/assets/temp-logos/singapore.png";
import lufthansaLogo from "@/assets/temp-logos/lufthansa.png";
import britishAirwaysLogo from "@/assets/temp-logos/british-airways.png";
import airFranceLogo from "@/assets/temp-logos/air-france.png";
import deltaLogo from "@/assets/temp-logos/delta.png";
import unitedLogo from "@/assets/temp-logos/united.png";
import americanLogo from "@/assets/temp-logos/american.png";
import jalLogo from "@/assets/temp-logos/jal.png";

export const UploadGeneratedLogos = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const logoMap = [
    { name: "Emirates", fileName: "emirates.png", imageSrc: emiratesLogo },
    { name: "Qatar Airways", fileName: "qatar.png", imageSrc: qatarLogo },
    { name: "Singapore Airlines", fileName: "singapore.png", imageSrc: singaporeLogo },
    { name: "Lufthansa", fileName: "lufthansa.png", imageSrc: lufthansaLogo },
    { name: "British Airways", fileName: "british-airways.png", imageSrc: britishAirwaysLogo },
    { name: "Air France", fileName: "air-france.png", imageSrc: airFranceLogo },
    { name: "Delta Air Lines", fileName: "delta.png", imageSrc: deltaLogo },
    { name: "United Airlines", fileName: "united.png", imageSrc: unitedLogo },
    { name: "American Airlines", fileName: "american.png", imageSrc: americanLogo },
    { name: "Japan Airlines", fileName: "jal.png", imageSrc: jalLogo },
  ];

  const fetchImageAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setResult(null);

    try {
      // Convert all logos to base64
      const logosWithData = await Promise.all(
        logoMap.map(async (logo) => ({
          name: logo.name,
          fileName: logo.fileName,
          imageData: await fetchImageAsBase64(logo.imageSrc),
        }))
      );

      const { data, error } = await supabase.functions.invoke('upload-generated-logos', {
        body: { logos: logosWithData }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Upload Complete!",
        description: `${data.successCount} logos uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Generated Logos</h2>
      <p className="mb-6 text-muted-foreground">
        This will upload the AI-generated airline logos to storage and update the database.
        You can replace these with real logos later.
      </p>

      <Button
        onClick={handleUpload}
        disabled={isUploading}
        size="lg"
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Uploading Logos...
          </>
        ) : (
          "Upload Generated Logos"
        )}
      </Button>

      {result && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Upload Results:</h3>
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
