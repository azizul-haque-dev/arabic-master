import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../database/drizzle/enums.js';
import { GenerateContentDto } from '../ai/dto/generate-content.dto.js';
import { CreateSentenceDto } from './dto/create-sentence.dto.js';
import { ListSentenceQueryDto } from './dto/list-sentence-query.dto.js';
import { UpdateSentenceDto } from './dto/update-sentence.dto.js';
import { SentenceService } from './sentence.service.js';

import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('sentences')
export class SentenceController {
  constructor(private readonly sentenceService: SentenceService) {}

  @Get()
  async list(@Query() query: ListSentenceQueryDto) {
    const { items, meta } = await this.sentenceService.list(query);
    return { message: 'Sentences fetched', data: { items, meta } };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const sentence = await this.sentenceService.getById(id);
    return { message: 'Sentence fetched', data: sentence };
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async create(
    @Body() dto: CreateSentenceDto,
    @CurrentUser() user: { id: string },
  ) {
    const sentence = await this.sentenceService.create(dto, user.id);
    return { message: 'Sentence created', data: sentence };
  }

  @Post('ai')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async generate(
    @Body() dto: GenerateContentDto,
    @CurrentUser() user: { id: string },
  ) {
    const sentence = await this.sentenceService.generateWithAi(
      dto.query,
      user.id,
    );
    return { message: 'Sentence queued for AI processing', data: sentence };
  }

  @Post(':id/resync-words')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async resyncWords(@Param('id') id: string) {
    const result = await this.sentenceService.resyncWords(id);
    return { message: 'Sentence word links queued for resync', data: result };
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateSentenceDto) {
    const sentence = await this.sentenceService.update(id, dto);
    return { message: 'Sentence updated', data: sentence };
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.sentenceService.remove(id);
    return { message: 'Sentence deleted', data: null };
  }
}
