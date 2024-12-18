"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-4">
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh]">
        <DialogTitle className="text-xl font-semibold mb-4">
          Share Your Feedback
        </DialogTitle>
        <iframe
          src="https://forms.zohopublic.com/advantageintegration1/form/FeedbackForm/formperma/4LotczXhM6wIg2KaHaHYox5hnupb1QiExqASbFYF1Kg?zf_rszfm=1"
          style={{
            border: "none",
            height: "801px",
            width: "100%",
            transition: "all 0.5s ease"
          }}
          aria-label="Feedback Form"
        />
      </DialogContent>
    </Dialog>
  );
}
