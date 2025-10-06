import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogoItem {
  id: string;
  name: string;
  logo_image_url: string;
  category: string;
  updated_at: string;
}

const Learn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logoItems, setLogoItems] = useState<LogoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogoItems();
  }, []);

  const fetchLogoItems = async () => {
    try {
      const { data, error } = await supabase
        .from("logo_items")
        .select("*")
        .eq("is_active", true)
        .eq("category", "airline");

      if (error) throw error;

      if (data && data.length > 0) {
        // Shuffle the items for random order
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setLogoItems(shuffled);
      } else {
        toast({
          title: "No logos found",
          description: "Please add some airline logos to the database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching logos:", error);
      toast({
        title: "Error loading logos",
        description: "Could not load airline logos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakName = (name: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRevealWithVoice = () => {
    setIsRevealed(true);
    if (logoItems[currentIndex]) {
      speakName(logoItems[currentIndex].name);
    }
  };

  const handleNext = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % logoItems.length);
  };

  const handlePrevious = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev - 1 + logoItems.length) % logoItems.length);
  };

  const currentLogo = logoItems[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-3xl font-bold text-primary animate-bounce-slow">
          Loading...
        </div>
      </div>
    );
  }

  if (!currentLogo) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No logos available</h2>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6 flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <Card className="w-full p-8 shadow-2xl animate-scale-up">
          <div className="bg-white rounded-3xl p-12 mb-8 shadow-inner flex items-center justify-center min-h-[300px]">
            <img
              src={`${currentLogo.logo_image_url}?v=${encodeURIComponent(currentLogo.updated_at)}`}
              alt={`${currentLogo.name} logo`}
              className="max-w-full max-h-64 object-contain"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                console.error("Image failed to load:", `${currentLogo.logo_image_url}?v=${encodeURIComponent(currentLogo.updated_at)}`);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Reveal Button or Name Display */}
          {!isRevealed ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleReveal}
                size="lg"
                className="h-20 md:h-24 text-lg md:text-2xl font-bold bg-gradient-primary hover:opacity-90 shadow-lg animate-pop"
              >
                Reveal
              </Button>
              <Button
                onClick={handleRevealWithVoice}
                size="lg"
                className="h-20 md:h-24 text-lg md:text-2xl font-bold bg-gradient-secondary hover:opacity-90 shadow-lg animate-pop"
              >
                <Volume2 className="w-6 h-6 md:w-8 md:h-8 mr-2 flex-shrink-0" />
                Say it loud
              </Button>
            </div>
          ) : (
            <div className="text-center mb-6 animate-scale-up">
              <div className="text-5xl font-bold text-primary mb-4">
                {currentLogo.name}
              </div>
              <Button
                onClick={() => speakName(currentLogo.name)}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-xl"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Hear Again
              </Button>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xl animate-pop">
          <Button
            type="button"
            onClick={handlePrevious}
            size="lg"
            className="h-20 text-2xl font-bold bg-gradient-secondary hover:opacity-90 shadow-lg"
          >
            Previous
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            size="lg"
            className="h-20 text-2xl font-bold bg-gradient-success hover:opacity-90 shadow-lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Learn;
