import { BadRequestException, Body, Controller, Delete, Get, Post } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AppSettingsService } from './app-settings.service';

function maskKey(key: string): string {
  if (key.length <= 12) return '***';
  return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: AppSettingsService) {}

  @Get()
  async getStatus() {
    const envKey = process.env.ANTHROPIC_API_KEY;
    const dbKey = await this.settings.get('anthropic_api_key');
    const activeKey = envKey || dbKey;
    return {
      configured: !!activeKey,
      source: envKey ? 'env' : dbKey ? 'database' : 'none',
      masked: activeKey ? maskKey(activeKey) : null,
      envPresent: !!envKey,
    };
  }

  @Post('api-key')
  async saveApiKey(@Body() body: { key: string }) {
    if (!body.key || typeof body.key !== 'string') {
      throw new BadRequestException('La clau API és obligatòria');
    }
    const trimmed = body.key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      throw new BadRequestException('Format invàlid. La clau ha de començar per sk-ant-');
    }
    await this.settings.set('anthropic_api_key', trimmed);
    return { saved: true, masked: maskKey(trimmed) };
  }

  @Delete('api-key')
  async deleteApiKey() {
    await this.settings.delete('anthropic_api_key');
    return { deleted: true };
  }

  @Post('api-key/test')
  async testApiKey() {
    const envKey = process.env.ANTHROPIC_API_KEY;
    const dbKey = await this.settings.get('anthropic_api_key');
    const key = envKey || dbKey;

    if (!key) {
      throw new BadRequestException('No hi ha cap API key configurada');
    }

    try {
      const client = new Anthropic({ apiKey: key });
      await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return {
        valid: true,
        source: envKey ? 'env' : 'database',
        message: 'Connexió amb Claude API verificada correctament',
      };
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new BadRequestException('Clau API invàlida (error d\'autenticació)');
      }
      throw new BadRequestException(`Error en la verificació: ${(error as Error).message}`);
    }
  }
}
