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
import { Role } from '../../generated/prisma/enums.js';
import { GenerateContentDto } from '../ai/dto/generate-content.dto.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateWordDto } from './dto/create-word.dto.js';
import { ListWordQueryDto } from './dto/list-word-query.dto.js';
import { UpdateWordDto } from './dto/update-word.dto.js';
import { WordService } from './words.service.js';

@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async list(@Query() query: ListWordQueryDto) {
    const { items, meta } = await this.wordService.list(query);
    return { message: 'Words fetched', data: { items, meta } };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const word = await this.wordService.getById(id);
    return { message: 'Word fetched', data: word };
  }

  // Creating/editing/deleting/generating content is restricted to
  // CONTENT_MANAGER and ADMIN — plain USERs shouldn't be able to write
  // content into the app. Change this if that assumption is wrong.
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async create(
    @Body() dto: CreateWordDto,
    @CurrentUser() user: { userId: string },
  ) {
    const word = await this.wordService.create(dto, user.userId);
    return { message: 'Word created', data: word };
  }

  @Post('ai')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async generate(
    @Body() dto: GenerateContentDto,
    @CurrentUser() user: { userId: string },
  ) {
    const word = await this.wordService.generateWithAi(dto.query, user.userId);
    return { message: 'Word generation started', data: word };
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateWordDto) {
    const word = await this.wordService.update(id, dto);
    return { message: 'Word updated', data: word };
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.CONTENT_MANAGER, Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.wordService.remove(id);
    return { message: 'Word deleted', data: null };
  }
}
