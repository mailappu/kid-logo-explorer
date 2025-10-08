import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UploadGeneratedLogos } from "@/components/UploadGeneratedLogos";
import { LogoHealthCheck } from "@/components/LogoHealthCheck";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MigrateLogosPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background p-6 flex flex-col">
      <div className="flex items-center justify-start mb-8">
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="text-xl font-bold">Back</span>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Tabs defaultValue="health" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="upload">Upload Logos</TabsTrigger>
          </TabsList>
          <TabsContent value="health">
            <LogoHealthCheck />
          </TabsContent>
          <TabsContent value="upload">
            <UploadGeneratedLogos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MigrateLogosPage;
