import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, ChevronRight, Volume2, VolumeX } from "lucide-react";
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

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logoItems, setLogoItems] = useState<LogoItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    logo: LogoItem;
    options: string[];
  } | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const pendingVoiceResultRef = useRef<{ matchedOption: string | null; transcript: string } | null>(null);

  useEffect(() => {
    fetchLogoItems();
  }, []);

  useEffect(() => {
    if (logoItems.length >= 4) {
      generateQuestion();
    }
  }, [logoItems]);

  const fetchLogoItems = async () => {
    try {
      const { data, error } = await supabase
        .from("logo_items")
        .select("*")
        .eq("is_active", true)
        .eq("category", "airline");

      if (error) throw error;

      if (data && data.length >= 4) {
        setLogoItems(data);
      } else {
        toast({
          title: "Not enough logos",
          description: "Need at least 4 logos for quiz mode.",
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

  const generateQuestion = () => {
    if (logoItems.length < 4) return;

    // Pick random logo as correct answer
    const correctLogo = logoItems[Math.floor(Math.random() * logoItems.length)];

    // Pick 3 other random logos as incorrect options
    const incorrectOptions = logoItems
      .filter((item) => item.id !== correctLogo.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((item) => item.name);

    // Combine and shuffle all options
    const allOptions = [correctLogo.name, ...incorrectOptions].sort(
      () => Math.random() - 0.5
    );

    setCurrentQuestion({
      logo: correctLogo,
      options: allOptions,
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const speakFeedback = (text: string) => {
    if (!isVoiceEnabled) return;
    
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answer);
    setQuestionsAnswered((prev) => prev + 1);
    setShowResult(true);

    if (answer === currentQuestion?.logo.name) {
      setScore((prev) => prev + 1);
      speakFeedback("Correct!");
    } else {
      speakFeedback(`Wrong! The correct answer is ${currentQuestion?.logo.name}`);
    }
  };

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log("Voice input transcript:", transcript);
      
      // Find matching option with more lenient matching
      const matchedOption = currentQuestion?.options.find((option) => {
        const optionLower = option.toLowerCase();
        const optionWords = optionLower.split(' ').filter(word => word.length > 2);
        const transcriptWords = transcript.split(' ').filter(word => word.length > 2);
        
        // Check if transcript contains the full option name
        if (transcript.includes(optionLower)) return true;
        
        // Check if option name is contained in transcript
        if (optionLower.includes(transcript)) return true;
        
        // Check if any significant word from option is in transcript
        const hasMatchingWord = optionWords.some(word => transcript.includes(word));
        if (hasMatchingWord) return true;
        
        // Check if any significant word from transcript is in option
        const hasReverseMatch = transcriptWords.some(word => optionLower.includes(word));
        if (hasReverseMatch) return true;
        
        return false;
      });

      console.log("Matched option:", matchedOption);
      
      // Defer handling until after recognition fully ends to avoid TTS suppression
      pendingVoiceResultRef.current = { matchedOption: matchedOption || null, transcript };
      try {
        recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      const pending = pendingVoiceResultRef.current;
      pendingVoiceResultRef.current = null;
      if (!pending) return;

      // Speak or evaluate only after recognition fully stops
      setTimeout(() => {
        if (pending.matchedOption) {
          handleAnswerSelect(pending.matchedOption);
        } else {
          const errorMessage = `I heard "${pending.transcript}". Sorry, I didn't get it. Can you please repeat again?`;
          speakFeedback(errorMessage);
          toast({
            title: "Didn't catch that",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }, 150);
    };

    recognition.start();
  };

  const getButtonVariant = (option: string) => {
    if (!selectedAnswer) return "default";
    if (option === currentQuestion?.logo.name) return "success";
    if (option === selectedAnswer) return "destructive";
    return "default";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-3xl font-bold text-primary animate-bounce-slow">
          Loading...
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not enough logos</h2>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 md:h-auto px-3 md:px-4"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 mr-1 md:mr-2" />
          <span className="text-lg md:text-xl font-bold">Back</span>
        </Button>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 md:h-auto px-3 md:px-4"
            title={isVoiceEnabled ? "Mute voice feedback" : "Enable voice feedback"}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </Button>
          <div className="text-xl md:text-3xl font-bold text-primary bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg whitespace-nowrap">
            Score: {score}/{questionsAnswered}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <Card className="w-full p-4 md:p-8 shadow-2xl animate-scale-up">
          {/* Logo Display */}
          <div className="bg-white rounded-3xl p-6 md:p-12 mb-6 md:mb-8 shadow-inner flex items-center justify-center min-h-[200px] md:min-h-[300px]">
            <img
              src={`${currentQuestion.logo.logo_image_url}?v=${encodeURIComponent(currentQuestion.logo.updated_at)}`}
              alt={`${currentQuestion.logo.name} logo`}
              className="max-w-full max-h-48 md:max-h-64 object-contain"
              loading="lazy"
              onError={(e) => {
                console.error("Image failed to load:", `${currentQuestion.logo.logo_image_url}?v=${encodeURIComponent(currentQuestion.logo.updated_at)}`);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Question Text */}
          <div className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-primary">
            Which airline is this?
          </div>

          {/* Result Display - Moved here below question */}
          {showResult && (
            <div className="text-center mb-6 md:mb-8 animate-scale-up">
              <div className={`text-3xl md:text-4xl font-bold mb-2 md:mb-3 ${
                selectedAnswer === currentQuestion.logo.name 
                  ? "text-success" 
                  : "text-destructive"
              }`}>
                {selectedAnswer === currentQuestion.logo.name ? "Correct!" : "Wrong!"}
              </div>
              {selectedAnswer !== currentQuestion.logo.name && (
                <div className="text-xl md:text-2xl font-semibold text-primary">
                  Correct answer: {currentQuestion.logo.name}
                </div>
              )}
            </div>
          )}

          {/* Voice Input Button */}
          <Button
            onClick={startVoiceRecognition}
            disabled={!!selectedAnswer || isListening}
            size="lg"
            className={`w-full h-14 md:h-16 text-lg md:text-xl font-bold mb-4 md:mb-6 ${
              isListening
                ? "bg-destructive animate-pulse"
                : "bg-gradient-secondary hover:opacity-90"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Say Your Answer
              </>
            )}
          </Button>

          {/* Answer Options */}
          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
                size="lg"
                className={`w-full h-16 md:h-20 text-lg md:text-2xl font-bold shadow-lg ${
                  getButtonVariant(option) === "success"
                    ? "bg-gradient-success hover:opacity-90"
                    : getButtonVariant(option) === "destructive"
                    ? "bg-destructive hover:opacity-90"
                    : "bg-gradient-primary hover:opacity-90"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>

        {/* Next Button - Shows after answering */}
        {showResult && (
          <Button
            onClick={generateQuestion}
            size="lg"
            className="mt-6 md:mt-8 h-16 md:h-20 px-10 md:px-12 text-xl md:text-2xl font-bold bg-gradient-success hover:opacity-90 shadow-lg animate-pop"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
