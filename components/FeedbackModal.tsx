'use client';

import React, { useState } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4" variant="outline">
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh]">
        <DialogTitle className="text-xl font-semibold mb-4">Share Your Feedback</DialogTitle>
        <iframe
          aria-label="Feedback Form"
          src="https://forms.zohopublic.com/advantageintegration1/form/FeedbackForm/formperma/4LotczXhM6wIg2KaHaHYox5hnupb1QiExqASbFYF1Kg?zf_rszfm=1"
          style={{
            border: 'none',
            height: '801px',
            transition: 'all 0.5s ease',
            width: '100%',
          }}
          title="Feedback Form"
        />
      </DialogContent>
    </Dialog>
  );
}
