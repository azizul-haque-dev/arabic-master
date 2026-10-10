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
import { SectionsService } from '../sections/sections.service.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ListCourseQueryDto } from './dto/list-course-query.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

@Controller('courses')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.CONTENT_MANAGER, Role.ADMIN)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly sectionsService: SectionsService,
  ) {}

  @Get()
  list(@Query() query: ListCourseQueryDto) {
    return this.coursesService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.coursesService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: RequestUser) {
    return this.coursesService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.coursesService.changeStatus(id, dto, user);
  }

  // Reorder sections within a course: PATCH /courses/:courseId/sections/reorder
  @Patch(':courseId/sections/reorder')
  reorderSections(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.sectionsService.reorder(courseId, dto.ids, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
