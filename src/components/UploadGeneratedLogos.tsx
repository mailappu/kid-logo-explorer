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
import koreanAirLogo from "@/assets/airline-logos/Korean_Air.png";
import icelandairLogo from "@/assets/airline-logos/Icelandair.png";
import hawaiianAirlinesLogo from "@/assets/airline-logos/Hawaiian_Airlines.png";
import southAfricanAirwaysLogo from "@/assets/airline-logos/South_African_Airways.png";
import klmRoyalDutchAirlinesLogo from "@/assets/airline-logos/KLM_Royal_Dutch_Airlines.png";
import airZimbabweLogo from "@/assets/airline-logos/Air_Zimbabwe.png";
import iberiaLogo from "@/assets/airline-logos/Iberia.png";
import hainanAirlinesLogo from "@/assets/airline-logos/Hainan_Airlines.png";
import cebuPacificLogo from "@/assets/airline-logos/Cebu_Pacific.png";
import saudiaAirlinesLogo from "@/assets/airline-logos/Saudia_Airlines.png";
import georgianAirwaysLogo from "@/assets/airline-logos/Georgian_Airways.png";
import rwandAirLogo from "@/assets/airline-logos/RwandAir.png";
import airPanamaLogo from "@/assets/airline-logos/AirPanama.png";
import swissAirLogo from "@/assets/airline-logos/SWISS_AIR.png";
import airTahitiLogo from "@/assets/airline-logos/Air_Tahiti.png";
import kenyaAirwaysLogo from "@/assets/airline-logos/Kenya_Airways.png";
import egyptairLogo from "@/assets/airline-logos/Egyptair.png";
import copaAirlinesLogo from "@/assets/airline-logos/Copa_Airlines.png";
import royalJordanianAirlinesLogo from "@/assets/airline-logos/Royal_Jordanian_Airlines.png";
import interCaribbeanLogo from "@/assets/airline-logos/InterCaribbean.png";
import easternAirwaysLogo from "@/assets/airline-logos/Eastern_Airways.png";
import lufthansaLogo from "@/assets/airline-logos/Lufthansa.png";
import royalBruneiAirlinesLogo from "@/assets/airline-logos/Royal_Brunei_Airlines.png";
import lionAirLogo from "@/assets/airline-logos/Lion_Air.png";
import fijiAirwaysLogo from "@/assets/airline-logos/Fiji_Airways.png";
import taromRomanianAirLogo from "@/assets/airline-logos/TAROM_Romanian_Air.png";
import croatiaAirlinesLogo from "@/assets/airline-logos/Croatia_Airlines.png";
import iranAirLogo from "@/assets/airline-logos/Iran_Air.png";
import batikAirLogo from "@/assets/airline-logos/Batik_Air.png";
import omanAirLogo from "@/assets/airline-logos/Oman_Air.png";
import ryanairLogo from "@/assets/airline-logos/Ryanair.png";
import silverAirwaysLogo from "@/assets/airline-logos/Silver_Airways.png";
import jetstarLogo from "@/assets/airline-logos/Jetstar.png";
import iraqiAirwaysLogo from "@/assets/airline-logos/Iraqi_Airways.png";
import aerolineasArgentinasLogo from "@/assets/airline-logos/Aerolineas_Argentinas.png";
import gulfAirLogo from "@/assets/airline-logos/Gulf_Air.png";
import bangkokAirwaysLogo from "@/assets/airline-logos/Bangkok_Airways.png";
import ravnAlaskaLogo from "@/assets/airline-logos/Ravn_Alaska.png";
import airSeychellesLogo from "@/assets/airline-logos/Air_Seychelles.png";
import uzbekistanAirwaysLogo from "@/assets/airline-logos/Uzbekistan_Airways.png";
import kuwaitAirwaysLogo from "@/assets/airline-logos/Kuwait_Airways.png";
import sunExpressLogo from "@/assets/airline-logos/SunExpress.png";
import cyprusAirwaysLogo from "@/assets/airline-logos/Cyprus_Airways.png";
import atlanticAirwaysLogo from "@/assets/airline-logos/Atlantic_Airways.png";
import airChinaLogo from "@/assets/airline-logos/Air_China.png";
import garudaIndonesiaLogo from "@/assets/airline-logos/Garuda_Indonesia.png";

export const UploadGeneratedLogos = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const logoMap = [
    { name: "Malaysian Airlines", fileName: "Malaysian_Airlines.png", imageSrc: malaysianAirlinesLogo },
    { name: "Qatar Airways", fileName: "Qatar_Airways.jpeg", imageSrc: qatarAirwaysLogo },
    { name: "SpiceJet", fileName: "SpiceJet.png", imageSrc: spiceJetLogo },
    { name: "Delta Airlines", fileName: "Delta_Airlines.png", imageSrc: deltaAirlinesLogo },
    { name: "Vietnam Airlines", fileName: "Vietnam_Airlines.png", imageSrc: vietnamAirlinesLogo },
    { name: "Indigo", fileName: "Indigo.jpeg", imageSrc: indigoLogo },
    { name: "Air France", fileName: "Air_France.png", imageSrc: airFranceLogo },
    { name: "Finnair", fileName: "Finnair.png", imageSrc: finnairLogo },
    { name: "LATAM Airlines", fileName: "LATAM_Airlines.png", imageSrc: latamAirlinesLogo },
    { name: "Akasa", fileName: "Akasa.png", imageSrc: akasaLogo },
    { name: "Austrian Airlines", fileName: "Austrian_Airlines.png", imageSrc: austrianAirlinesLogo },
    { name: "Brussels Airlines", fileName: "Brussels_Airlines.png", imageSrc: brusselsAirlinesLogo },
    { name: "Caribbean Airlines", fileName: "Caribbean_Airlines.png", imageSrc: caribbeanAirlinesLogo },
    { name: "Cathay Pacific", fileName: "Cathay_Pacific.png", imageSrc: cathayPacificLogo },
    { name: "China Airlines", fileName: "China_Airlines.png", imageSrc: chinaAirlinesLogo },
    { name: "Condor", fileName: "Condor.png", imageSrc: condorLogo },
    { name: "Emirates", fileName: "Emirates.png", imageSrc: emiratesLogo },
    { name: "Ethiopian Airlines", fileName: "Ethiopian_Airlines.png", imageSrc: ethiopianAirlinesLogo },
    { name: "EVA Air", fileName: "EVA_Air.png", imageSrc: evaAirLogo },
    { name: "Japan Airlines", fileName: "Japan_Airlines.png", imageSrc: japanAirlinesLogo },
    { name: "Philippine Airlines", fileName: "Philippine_Airlines.png", imageSrc: philippineAirlinesLogo },
    { name: "Singapore Airlines", fileName: "Singapore_Airlines.jpeg", imageSrc: singaporeAirlinesLogo },
    { name: "Srilankan Airlines", fileName: "Srilankan_Airlines.png", imageSrc: srilankanAirlinesLogo },
    { name: "Turkish Airlines", fileName: "Turkish_Airlines.png", imageSrc: turkishAirlinesLogo },
    { name: "Vistara", fileName: "Vistara.png", imageSrc: vistaraLogo },
    { name: "Korean Air", fileName: "Korean_Air.png", imageSrc: koreanAirLogo },
    { name: "Icelandair", fileName: "Icelandair.png", imageSrc: icelandairLogo },
    { name: "Hawaiian Airlines", fileName: "Hawaiian_Airlines.png", imageSrc: hawaiianAirlinesLogo },
    { name: "South African Airways", fileName: "South_African_Airways.png", imageSrc: southAfricanAirwaysLogo },
    { name: "KLM Royal Dutch Airlines", fileName: "KLM_Royal_Dutch_Airlines.png", imageSrc: klmRoyalDutchAirlinesLogo },
    { name: "Ryanair", fileName: "Ryanair.png", imageSrc: ryanairLogo },
    { name: "Silver Airways", fileName: "Silver_Airways.png", imageSrc: silverAirwaysLogo },
    { name: "Jetstar", fileName: "Jetstar.png", imageSrc: jetstarLogo },
    { name: "Iraqi Airways", fileName: "Iraqi_Airways.png", imageSrc: iraqiAirwaysLogo },
    { name: "Aerolineas Argentinas", fileName: "Aerolineas_Argentinas.png", imageSrc: aerolineasArgentinasLogo },
    { name: "Gulf Air", fileName: "Gulf_Air.png", imageSrc: gulfAirLogo },
    { name: "Bangkok Airways", fileName: "Bangkok_Airways.png", imageSrc: bangkokAirwaysLogo },
    { name: "Ravn Alaska", fileName: "Ravn_Alaska.png", imageSrc: ravnAlaskaLogo },
    { name: "Air Seychelles", fileName: "Air_Seychelles.png", imageSrc: airSeychellesLogo },
    { name: "Uzbekistan Airways", fileName: "Uzbekistan_Airways.png", imageSrc: uzbekistanAirwaysLogo },
    { name: "Kuwait Airways", fileName: "Kuwait_Airways.png", imageSrc: kuwaitAirwaysLogo },
    { name: "SunExpress", fileName: "SunExpress.png", imageSrc: sunExpressLogo },
    { name: "Cyprus Airways", fileName: "Cyprus_Airways.png", imageSrc: cyprusAirwaysLogo },
    { name: "Atlantic Airways", fileName: "Atlantic_Airways.png", imageSrc: atlanticAirwaysLogo },
    { name: "Air China", fileName: "Air_China.png", imageSrc: airChinaLogo },
    { name: "Garuda Indonesia", fileName: "Garuda_Indonesia.png", imageSrc: garudaIndonesiaLogo },
  ];

  // Validate: Check for duplicates and count
  const logoNames = logoMap.map(logo => logo.name);
  const duplicates = logoNames.filter((name, index) => logoNames.indexOf(name) !== index);
  
  console.log(`Total logos: ${logoMap.length}`);
  console.log(`Duplicates found: ${duplicates.length > 0 ? duplicates.join(', ') : 'None'}`);


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
      <h2 className="text-2xl font-bold mb-4">Re-upload Corrupted Logos</h2>
      <p className="mb-6 text-muted-foreground">
        Upload airline logos to the database. Currently ready to upload {logoMap.length} logos.
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
