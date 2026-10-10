import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../database/drizzle/enums.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { RequestUser } from '../auth/types/jwt-payload.type.js';
import { ConversationsService } from './conversations.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { ListConversationQueryDto } from './dto/list-conversation-query.dto.js';
import { ReplaceTurnsDto } from './dto/replace-turns.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

// Administrative CMS endpoints for managing conversations. Protected by AccessTokenGuard and RolesGuard.
// Public/learner-facing endpoints for PUBLISHED conversations will be provided in a dedicated controller.
@Controller('conversations')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.CONTENT_MANAGER, Role.ADMIN)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  list(@Query() query: ListConversationQueryDto) {
    return this.conversationsService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.conversationsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateConversationDto, @CurrentUser() user: RequestUser) {
    return this.conversationsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.conversationsService.update(id, dto, user);
  }

  @Put(':id/turns')
  replaceTurns(
    @Param('id') id: string,
    @Body() dto: ReplaceTurnsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.conversationsService.replaceTurns(id, dto, user);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.conversationsService.changeStatus(id, dto, user);
  }

  // Method-level @Roles overrides class-level decorator via Reflector#getAllAndOverride (Admin only)
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
