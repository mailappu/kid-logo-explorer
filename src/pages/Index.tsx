import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Trophy, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-background p-6 flex flex-col items-center justify-center relative">
      {/* Title */}
      <div className="text-center mb-12 animate-scale-up">
        <h1 className="text-6xl font-bold text-primary mb-4 drop-shadow-lg">
          Find The Airline
        </h1>
        <p className="text-2xl text-foreground/80 font-medium">
          Learn airline logos the fun way! ✈️
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Learn Mode Card */}
        <Card 
          className="p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl animate-pop"
          onClick={() => navigate("/learn")}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-gradient-primary p-8 rounded-full shadow-lg">
              <GraduationCap className="w-20 h-20 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-primary">Learn Mode</h2>
            <p className="text-xl text-muted-foreground">
              See airline logos and hear their names!
            </p>
            <Button
              size="lg"
              className="w-full h-16 text-2xl font-bold bg-gradient-primary hover:opacity-90 shadow-lg"
            >
              Start Learning
            </Button>
          </div>
        </Card>

        {/* Quiz Mode Card */}
        <Card 
          className="p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl animate-pop"
          onClick={() => navigate("/quiz")}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-gradient-secondary p-8 rounded-full shadow-lg">
              <Trophy className="w-20 h-20 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-secondary-foreground">Quiz Mode</h2>
            <p className="text-xl text-muted-foreground">
              Test your knowledge and earn points!
            </p>
            <Button
              size="lg"
              className="w-full h-16 text-2xl font-bold bg-gradient-secondary hover:opacity-90 shadow-lg"
            >
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>

      {/* Disclaimer Link */}
      <div className="mt-12">
        <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Info className="w-4 h-4 mr-2" />
              Disclaimer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Disclaimer</DialogTitle>
              <DialogDescription className="text-base leading-relaxed pt-4">
                All logos and images displayed on this app are the property of their respective owners. 
                I am not affiliated with, endorsed by, or the owner of any of the logos shown. 
                These images have been sourced from StickPNG.com and are used solely for educational 
                and informational purposes. No copyright infringement is intended.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
