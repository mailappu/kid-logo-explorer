import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Import airline logos
import chinaAirlinesLogo from "@/assets/airline-logos/China_Airlines.png";
import emiratesLogo from "@/assets/airline-logos/Emirates.png";
import akasaLogo from "@/assets/airline-logos/Akasa.png";
import caribbeanAirlinesLogo from "@/assets/airline-logos/Caribbean_Airlines.png";
import deltaAirlinesLogo from "@/assets/airline-logos/Delta_Airlines.png";
import condorLogo from "@/assets/airline-logos/Condor.png";
import cathayPacificLogo from "@/assets/airline-logos/Cathay_Pacific.png";
import austrianAirlinesLogo from "@/assets/airline-logos/Austrian_Airlines.png";
import airFranceLogo from "@/assets/airline-logos/Air_France.png";
import brusselsAirlinesLogo from "@/assets/airline-logos/Brussels_Airlines.png";
import philippineAirlinesLogo from "@/assets/airline-logos/Philippine_Airlines.png";
import singaporeAirlinesLogo from "@/assets/airline-logos/Singapore_Airlines.jpeg";
import finnairLogo from "@/assets/airline-logos/Finnair.png";
import japanAirlinesLogo from "@/assets/airline-logos/Japan_Airlines.png";
import ethiopianAirlinesLogo from "@/assets/airline-logos/Ethiopian_Airlines.png";
import latamAirlinesLogo from "@/assets/airline-logos/LATAM_Airlines.png";
import indigoLogo from "@/assets/airline-logos/Indigo.jpeg";
import qatarAirwaysLogo from "@/assets/airline-logos/Qatar_Airways.jpeg";
import evaAirLogo from "@/assets/airline-logos/EVA_Air.png";
import malaysianAirlinesLogo from "@/assets/airline-logos/Malaysian_Airlines.png";

export const UploadGeneratedLogos = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const logoMap = [
    { name: "China Airlines", fileName: "China_Airlines.png", imageSrc: chinaAirlinesLogo },
    { name: "Emirates", fileName: "Emirates.png", imageSrc: emiratesLogo },
    { name: "Akasa", fileName: "Akasa.png", imageSrc: akasaLogo },
    { name: "Caribbean Airlines", fileName: "Caribbean_Airlines.png", imageSrc: caribbeanAirlinesLogo },
    { name: "Delta Airlines", fileName: "Delta_Airlines.png", imageSrc: deltaAirlinesLogo },
    { name: "Condor", fileName: "Condor.png", imageSrc: condorLogo },
    { name: "Cathay Pacific", fileName: "Cathay_Pacific.png", imageSrc: cathayPacificLogo },
    { name: "Austrian Airlines", fileName: "Austrian_Airlines.png", imageSrc: austrianAirlinesLogo },
    { name: "Air France", fileName: "Air_France.png", imageSrc: airFranceLogo },
    { name: "Brussels Airlines", fileName: "Brussels_Airlines.png", imageSrc: brusselsAirlinesLogo },
    { name: "Philippine Airlines", fileName: "Philippine_Airlines.png", imageSrc: philippineAirlinesLogo },
    { name: "Singapore Airlines", fileName: "Singapore_Airlines.jpeg", imageSrc: singaporeAirlinesLogo },
    { name: "Finnair", fileName: "Finnair.png", imageSrc: finnairLogo },
    { name: "Japan Airlines", fileName: "Japan_Airlines.png", imageSrc: japanAirlinesLogo },
    { name: "Ethiopian Airlines", fileName: "Ethiopian_Airlines.png", imageSrc: ethiopianAirlinesLogo },
    { name: "LATAM Airlines", fileName: "LATAM_Airlines.png", imageSrc: latamAirlinesLogo },
    { name: "Indigo", fileName: "Indigo.jpeg", imageSrc: indigoLogo },
    { name: "Qatar Airways", fileName: "Qatar_Airways.jpeg", imageSrc: qatarAirwaysLogo },
    { name: "EVA Air", fileName: "EVA_Air.png", imageSrc: evaAirLogo },
    { name: "Malaysian Airlines", fileName: "Malaysian_Airlines.png", imageSrc: malaysianAirlinesLogo },
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
      <h2 className="text-2xl font-bold mb-4">Upload Airline Logos</h2>
      <p className="mb-6 text-muted-foreground">
        This will upload the airline logos to storage and update the database with the selected airlines.
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
          "Upload Airline Logos"
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
