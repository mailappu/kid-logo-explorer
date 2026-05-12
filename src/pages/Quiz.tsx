import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLogoItems } from "@/hooks/useLogoItems";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  isSpeechRecognitionSupported,
  useSpeechRecognition,
} from "@/hooks/useSpeechRecognition";
import {
  fuzzyMatchOption,
  getLogoUrl,
  getRandomItem,
  pickQuizQuestion,
  type QuizQuestion,
} from "@/lib/logo";

const CORRECT_VOICE = [
  "Bingo, You got it right",
  "Bingo, You are correct",
  "You are right",
  "You are correct",
  "Well Done",
  "Awesome",
  "Perfect",
];
const CORRECT_TEXT = ["Perfect", "Correct", "Right"];
const WRONG_VOICE = [
  "Hmm Nope",
  "Nope",
  "it was wrong",
  "Learn again",
  "No No",
  "Oh No",
];
const WRONG_TEXT = ["Wrong", "Nope", "No No"];

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logoItems, isLoading } = useLogoItems({ category: "airline" });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const { speak } = useSpeechSynthesis(isVoiceEnabled);

  const generateQuestion = useCallback(() => {
    setRecentlyUsed((prev) => {
      const result = pickQuizQuestion(logoItems, prev);
      if (!result) return prev;
      setCurrentQuestion(result.question);
      setSelectedAnswer(null);
      setShowResult(false);
      return result.nextRecentlyUsed;
    });
  }, [logoItems]);

  // First question once data is ready
  useEffect(() => {
    if (logoItems.length >= 4 && !currentQuestion) {
      generateQuestion();
    } else if (!isLoading && logoItems.length > 0 && logoItems.length < 4) {
      toast({
        title: "Not enough logos",
        description: "Need at least 4 logos for quiz mode.",
        variant: "destructive",
      });
    }
  }, [logoItems, currentQuestion, generateQuestion, isLoading, toast]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (selectedAnswer || !currentQuestion) return;

      setSelectedAnswer(answer);
      setQuestionsAnswered((p) => p + 1);
      setShowResult(true);

      if (answer === currentQuestion.logo.name) {
        setScore((p) => p + 1);
        setFeedbackText(getRandomItem(CORRECT_TEXT));
        speak(getRandomItem(CORRECT_VOICE));
      } else {
        setFeedbackText(getRandomItem(WRONG_TEXT));
        speak(`${getRandomItem(WRONG_VOICE)}. The correct answer is ${currentQuestion.logo.name}`);
      }
    },
    [selectedAnswer, currentQuestion, speak],
  );

  const { start: startListening, isListening } = useSpeechRecognition({
    onResult: ({ transcript }) => {
      const matched = currentQuestion
        ? fuzzyMatchOption(transcript, currentQuestion.options)
        : null;

      if (matched) {
        handleAnswerSelect(matched);
      } else {
        const msg = `I heard "${transcript}". Sorry, I didn't get it. Can you please repeat again?`;
        speak(msg);
        toast({
          title: "Didn't catch that",
          description: msg,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice error",
        description: `Voice recognition error: ${error}. Please try again.`,
        variant: "destructive",
      });
    },
    onTimeout: () => {
      toast({
        title: "Timeout",
        description: "Voice recognition timed out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      toast({
        title: "Not supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    startListening();
  }, [startListening, toast]);

  const getAnswerClasses = (option: string) => {
    if (!selectedAnswer || !currentQuestion) {
      return "bg-gradient-primary hover:opacity-90";
    }
    if (option === currentQuestion.logo.name) {
      return "bg-gradient-success hover:opacity-90";
    }
    if (option === selectedAnswer) {
      return "bg-destructive hover:opacity-90";
    }
    return "bg-gradient-primary hover:opacity-90";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-3xl font-bold text-primary animate-bounce-slow">Loading...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not enough logos</h2>
          <Button type="button" onClick={() => navigate("/")} className="bg-gradient-primary">
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
          type="button"
          onClick={() => navigate("/")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 md:h-auto px-3 md:px-4"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 mr-1 md:mr-2" />
          <span className="text-lg md:text-xl font-bold">Back</span>
        </Button>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            type="button"
            onClick={() => setIsVoiceEnabled((v) => !v)}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 md:h-auto px-3 md:px-4"
            aria-label={isVoiceEnabled ? "Mute voice feedback" : "Enable voice feedback"}
            aria-pressed={isVoiceEnabled}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </Button>
          <div
            className="text-xl md:text-3xl font-bold text-primary bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg whitespace-nowrap"
            aria-live="polite"
          >
            Score: {score}/{questionsAnswered}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <Card className="w-full p-4 md:p-8 shadow-2xl animate-scale-up">
          {/* Logo */}
          <div className="bg-white rounded-3xl p-6 md:p-12 mb-6 md:mb-8 shadow-inner flex items-center justify-center min-h-[200px] md:min-h-[300px]">
            <img
              key={currentQuestion.logo.id}
              src={getLogoUrl(currentQuestion.logo)}
              alt={currentQuestion.logo.name}
              className="max-w-full max-h-48 md:max-h-64 object-contain"
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              onError={(e) => {
                console.error("Image failed to load:", getLogoUrl(currentQuestion.logo));
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-primary">
            Which airline is this?
          </h2>

          {showResult && (
            <div className="text-center mb-6 md:mb-8 animate-scale-up" aria-live="polite">
              <div
                className={cn(
                  "text-3xl md:text-4xl font-bold mb-2 md:mb-3",
                  selectedAnswer === currentQuestion.logo.name
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {feedbackText}
              </div>
              {selectedAnswer !== currentQuestion.logo.name && (
                <div className="text-xl md:text-2xl font-semibold text-primary">
                  Correct answer: {currentQuestion.logo.name}
                </div>
              )}
            </div>
          )}

          <Button
            type="button"
            onClick={handleStartListening}
            disabled={!!selectedAnswer || isListening}
            size="lg"
            className={cn(
              "w-full h-14 md:h-16 text-lg md:text-xl font-bold mb-4 md:mb-6",
              isListening
                ? "bg-destructive animate-pulse"
                : "bg-gradient-secondary hover:opacity-90",
            )}
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

          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                type="button"
                onClick={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
                size="lg"
                className={cn(
                  "w-full h-16 md:h-20 text-lg md:text-2xl font-bold shadow-lg",
                  getAnswerClasses(option),
                )}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>

        {showResult && (
          <Button
            type="button"
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
