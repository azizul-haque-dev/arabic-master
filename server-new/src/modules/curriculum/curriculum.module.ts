import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { CoursesController } from './courses/courses.controller.js';
import { CoursesService } from './courses/courses.service.js';
import { LessonsController } from './lessons/lessons.controller.js';
import { LessonsService } from './lessons/lessons.service.js';
import { SectionsController } from './sections/sections.controller.js';
import { SectionsService } from './sections/sections.service.js';

@Module({
  imports: [PassportModule.register({ session: false }), AuthModule],
  controllers: [CoursesController, SectionsController, LessonsController],
  providers: [CoursesService, SectionsService, LessonsService],
  exports: [CoursesService, SectionsService, LessonsService],
})
export class CurriculumModule {}
