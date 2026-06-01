import { Body, Controller, Post } from '@nestjs/common';
import { AssistantService } from './assistant.service';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Controller('assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}

  @Post('ask')
  ask(@Body() body: { messages: ChatMessage[] }) {
    return this.service.ask(body.messages ?? []);
  }
}
