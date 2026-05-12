import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLogoItems } from "@/hooks/useLogoItems";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { getLogoUrl, shuffle } from "@/lib/logo";

const Learn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logoItems, isLoading } = useLogoItems({ category: "airline" });
  const { speak } = useSpeechSynthesis(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Shuffle once when items arrive
  const shuffledLogos = useMemo(() => shuffle(logoItems), [logoItems]);

  useEffect(() => {
    if (!isLoading && logoItems.length === 0) {
      toast({
        title: "No logos found",
        description: "Please add some airline logos to the database.",
        variant: "destructive",
      });
    }
  }, [isLoading, logoItems.length, toast]);

  const currentLogo = shuffledLogos[currentIndex];

  // Preload neighbors for instant transitions
  useEffect(() => {
    if (shuffledLogos.length === 0) return;
    const indexes = [
      (currentIndex + 1) % shuffledLogos.length,
      (currentIndex + 2) % shuffledLogos.length,
      (currentIndex - 1 + shuffledLogos.length) % shuffledLogos.length,
    ];
    indexes.forEach((i) => {
      const item = shuffledLogos[i];
      if (!item) return;
      const img = new Image();
      img.src = getLogoUrl(item);
    });
  }, [currentIndex, shuffledLogos]);

  const speakName = useCallback(
    (name: string) => speak(name, { rate: 0.8, pitch: 1.2 }),
    [speak],
  );

  const handleReveal = useCallback(() => setIsRevealed(true), []);
  const handleRevealWithVoice = useCallback(() => {
    setIsRevealed(true);
    if (currentLogo) speakName(currentLogo.name);
  }, [currentLogo, speakName]);

  const handleNext = useCallback(() => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledLogos.length);
  }, [shuffledLogos.length]);

  const handlePrevious = useCallback(() => {
    setIsRevealed(false);
    setCurrentIndex(
      (prev) => (prev - 1 + shuffledLogos.length) % shuffledLogos.length,
    );
  }, [shuffledLogos.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-3xl font-bold text-primary animate-bounce-slow">Loading...</div>
      </div>
    );
  }

  if (!currentLogo) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No logos available</h2>
          <Button type="button" onClick={() => navigate("/")} className="bg-gradient-primary">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-background p-6 flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-start flex-shrink-0">
        <Button
          type="button"
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="text-xl font-bold">Back</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full flex-1 overflow-y-auto">
        <Card className="w-full p-8 shadow-2xl animate-scale-up">
          <div className="bg-white rounded-3xl p-12 mb-8 shadow-inner flex items-center justify-center min-h-[300px]">
            <img
              key={currentLogo.id}
              src={getLogoUrl(currentLogo)}
              alt={currentLogo.name}
              className="max-w-full max-h-64 object-contain"
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              onError={(e) => {
                console.error("Image failed to load:", getLogoUrl(currentLogo));
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>

          {!isRevealed ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={handleReveal}
                size="lg"
                className="h-20 md:h-24 text-lg md:text-2xl font-bold bg-gradient-primary hover:opacity-90 shadow-lg animate-pop"
              >
                Reveal
              </Button>
              <Button
                type="button"
                onClick={handleRevealWithVoice}
                size="lg"
                className="h-20 md:h-24 text-lg md:text-2xl font-bold bg-gradient-secondary hover:opacity-90 shadow-lg animate-pop"
              >
                <Volume2 className="w-6 h-6 md:w-8 md:h-8 mr-2 flex-shrink-0" />
                Say it loud
              </Button>
            </div>
          ) : (
            <div className="text-center mb-6 animate-scale-up" aria-live="polite">
              <div className="text-5xl font-bold text-primary mb-4">{currentLogo.name}</div>
              <Button
                type="button"
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
