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
import spiceJetLogo from "@/assets/airline-logos/SpiceJet.png";
import turkishAirlinesLogo from "@/assets/airline-logos/Turkish_Airlines.png";
import vistaraLogo from "@/assets/airline-logos/Vistara.png";
import srilankanAirlinesLogo from "@/assets/airline-logos/Srilankan_Airlines.png";
import vietnamAirlinesLogo from "@/assets/airline-logos/Vietnam_Airlines.png";
import turkmenistanAirlinesLogo from "@/assets/airline-logos/Turkmenistan_Airlines.png";
import qantasLogo from "@/assets/airline-logos/Qantas.png";
import hongKongAirlinesLogo from "@/assets/airline-logos/Hong_Kong_Airlines.png";
import lamMozambiqueAirlinesLogo from "@/assets/airline-logos/LAM_Mozambique_Airlines.png";
import thaiAirlinesLogo from "@/assets/airline-logos/Thai_Airlines.png";
import armenianAirlinesLogo from "@/assets/airline-logos/Armenian_Airlines.png";
import unitedAirlinesLogo from "@/assets/airline-logos/United_Airlines.png";
import britishAirwaysLogo from "@/assets/airline-logos/British_Airways.png";
import southwestAirlinesLogo from "@/assets/airline-logos/Southwest_Airlines.png";
import asiansAirlinesLogo from "@/assets/airline-logos/Asians_Airlines.png";
import airEuropaLogo from "@/assets/airline-logos/Air_Europa.png";
import bhutanAirlinesLogo from "@/assets/airline-logos/Bhutan_Airlines.png";
import aerLingusLogo from "@/assets/airline-logos/Aer_Lingus.png";
import madagascarAirlinesLogo from "@/assets/airline-logos/Madagascar_Airlines.png";
import airIndiaExpressLogo from "@/assets/airline-logos/Air_India_Express.png";
import myanmarNationalAirlinesLogo from "@/assets/airline-logos/Myanmar_National_Airlines.png";
import pakistanInternationalAirlinesLogo from "@/assets/airline-logos/Pakistan_International_Airlines.png";
import airNewzealandLogo from "@/assets/airline-logos/Air_Newzealand.png";
import airSerbiaLogo from "@/assets/airline-logos/AirSerbia.png";
import tibetAirlinesLogo from "@/assets/airline-logos/Tibet_Airlines.png";
import airCanadaLogo from "@/assets/airline-logos/Air_Canada.png";
import israirLogo from "@/assets/airline-logos/Israir.png";
import azerbaijanAirlinesLogo from "@/assets/airline-logos/Azerbaijan_Airlines.png";
import laoAirlinesLogo from "@/assets/airline-logos/Lao_Airlines.png";
import sichuanAirlinesLogo from "@/assets/airline-logos/Sichuan_Airlines.png";
import airlinkAirlinesLogo from "@/assets/airline-logos/Airlink_Airlines.png";
import aeroMexicoLogo from "@/assets/airline-logos/Aero_Mexico.png";
import tunisairLogo from "@/assets/airline-logos/Tunisair.png";
import nepalAirlinesLogo from "@/assets/airline-logos/Nepal_Airlines.png";
import airMauritiusLogo from "@/assets/airline-logos/Air_Mauritius.png";

export const UploadGeneratedLogos = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const logoMap = [
    { name: "Air Mauritius", fileName: "Air_Mauritius.png", imageSrc: airMauritiusLogo },
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
      <h2 className="text-2xl font-bold mb-4">Upload Missing Logo</h2>
      <p className="mb-6 text-muted-foreground">
        Upload Air Mauritius logo to complete the collection. (54 logos already in database)
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
