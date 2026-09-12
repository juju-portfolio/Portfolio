'use client';
import type { RefObject } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover';

export default function GuideInvitation({
  buttonRef,
  open,
  onOpenChange,
  onStart,
  deck = false,
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
  deck?: boolean;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <button
            ref={buttonRef}
            type="button"
            className={`guide-hit ${deck ? 'deck-guide-hit' : 'page-guide-hit'}`}
            aria-label="Meet your guide"
          />
        }
      />
      <PopoverContent
        className="guide-invitation"
        side="top"
        sideOffset={14}
        align="start"
      >
        <Button
          className="invitation-close"
          variant="ghost"
          aria-label="Close guide introduction"
          onClick={() => onOpenChange(false)}
        >
          <X size={16} />
        </Button>
        <span className="guide-hello">A little company?</span>
        <PopoverTitle>Hey, I’m your guide.</PopoverTitle>
        <PopoverDescription>
          I can show you around my projects and the thinking behind them. Ready
          for a quick tour?
        </PopoverDescription>
        <Button onClick={onStart}>
          Start a quick tour <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          className="guide-dismiss"
          onClick={() => onOpenChange(false)}
        >
          I’ll explore on my own
        </button>
      </PopoverContent>
    </Popover>
  );
}
