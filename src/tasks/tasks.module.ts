import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller';
import { TasksService } from './service/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './repository/task.repository';
import { Task } from './entity/task.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TaskRepository],
})
export class TasksModule {}
