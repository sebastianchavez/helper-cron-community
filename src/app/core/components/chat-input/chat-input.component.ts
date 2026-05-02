import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent {
  @Input() input: string = '';
  @Input() loading: boolean = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() sendMessage = new EventEmitter<string>();
  @Output() stopResponse = new EventEmitter<void>();

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  onInputChange(value: string) {
    this.input = value;
    this.inputChange.emit(value);
  }

  onEnterKey(event: Event) {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey && !this.loading) {
      keyEvent.preventDefault();
      this.onSendMessage();
    }
  }

  onSendMessage() {
    const message = this.getCompleteMessage();
    if (message && !this.loading) {
      this.sendMessage.emit(message);
      this.clearInput();
    }
  }

  onStopResponse() {
    this.stopResponse.emit();
  }

  focusInput() {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  getCompleteMessage(): string {
    return this.input.trim();
  }

  clearInput() {
    this.input = '';
    this.inputChange.emit('');
  }

  showCommandSuggestion(command: string, originalMessage: string) {}
}
