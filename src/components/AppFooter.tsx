import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AppFooterProps {
  className?: string;
}

export const AppFooter = ({ className }: AppFooterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 " +
        (className ?? "")
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Info className="w-4 h-4 mr-2" />
            Disclaimer
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Disclaimer</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-4">
              All logos and images displayed on this app are the property of their
              respective owners. I am not affiliated with, endorsed by, or the owner
              of any of the logos shown. These images have been sourced from
              StickPNG.com and are used solely for educational and informational
              purposes. No copyright infringement is intended.
              <br />
              <br />
              For any feedback reach out to{" "}
              <a href="mailto:mailappu@gmail.com" className="text-primary hover:underline">
                mailappu@gmail.com
              </a>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <span className="text-sm text-muted-foreground">
        Created by{" "}
        <a
          href="https://www.linkedin.com/in/pradeep-kumars/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Pradeep
        </a>{" "}
        | Assisted by ChatGPT
      </span>
    </div>
  );
};
