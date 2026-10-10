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
import { LessonsService } from '../lessons/lessons.service.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { ListSectionQueryDto } from './dto/list-section-query.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { SectionsService } from './sections.service.js';

@Controller('sections')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.CONTENT_MANAGER, Role.ADMIN)
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly lessonsService: LessonsService,
  ) {}

  @Get()
  list(@Query() query: ListSectionQueryDto) {
    return this.sectionsService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.sectionsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateSectionDto, @CurrentUser() user: RequestUser) {
    return this.sectionsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.sectionsService.update(id, dto, user);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.sectionsService.changeStatus(id, dto, user);
  }

  // Reorder lessons within a section: PATCH /sections/:sectionId/lessons/reorder
  @Patch(':sectionId/lessons/reorder')
  reorderLessons(
    @Param('sectionId') sectionId: string,
    @Body() dto: ReorderDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.lessonsService.reorderInSection(sectionId, dto.ids, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
