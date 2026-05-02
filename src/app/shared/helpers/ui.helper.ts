import { ElementRef } from '@angular/core';

export class UiHelper {
  static forceScrollToBottom(messagesContainer?: ElementRef, maxAttempts: number = 5): void {
    const attemptScroll = (attempts: number = 0) => {
      if (attempts > maxAttempts) return;
      setTimeout(() => {
        try {
          if (messagesContainer?.nativeElement) {
            const element = messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
          }
          const messagesArea = document.querySelector('app-messages-area');
          if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }
        } catch (err) {
          if (attempts < 3) attemptScroll(attempts + 1);
        }
      }, 50 * (attempts + 1));
    };
    attemptScroll();
  }

  static startTypingAnimation(typingTexts: string[], callback: (text: string) => void): any {
    let index = 0;
    callback(typingTexts[0]);
    return setInterval(() => {
      index = (index + 1) % typingTexts.length;
      callback(typingTexts[index]);
    }, 2000);
  }

  static stopAnimation(intervalId: any): void {
    if (intervalId) clearInterval(intervalId);
  }

  static startDotsAnimation(callback: (dots: string) => void): any {
    let dotCount = 0;
    callback('.');
    return setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      callback('.'.repeat(dotCount || 1));
    }, 500);
  }

  static handleOutsideClick(event: MouseEvent, elementSelector: string, callback: () => void): void {
    const target = event.target as Element;
    if (!target.closest(elementSelector)) {
      callback();
    }
  }
}
