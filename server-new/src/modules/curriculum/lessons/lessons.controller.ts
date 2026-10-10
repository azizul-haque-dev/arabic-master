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
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { ReorderDto } from '../../../common/dto/reorder.dto.js';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto.js';
import { Role } from '../../../database/drizzle/enums.js';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { RequestUser } from '../../auth/types/jwt-payload.type.js';
import { AddLessonItemDto } from './dto/add-lesson-item.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ListLessonQueryDto } from './dto/list-lesson-query.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { LessonsService } from './lessons.service.js';

@Controller('lessons')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.CONTENT_MANAGER, Role.ADMIN)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  list(@Query() query: ListLessonQueryDto) {
    return this.lessonsService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.lessonsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: RequestUser) {
    return this.lessonsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.update(id, dto, user);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.changeStatus(id, dto, user);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() dto: AddLessonItemDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.addItem(id, dto, user);
  }

  // Route ':id/items/reorder' must be evaluated before ':id/items/:itemId'
  @Patch(':id/items/reorder')
  reorderItems(
    @Param('id') id: string,
    @Body() dto: ReorderDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.reorderItems(id, dto.ids, user);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.removeItem(id, itemId, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
