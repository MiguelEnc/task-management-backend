import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilteredDto } from '../dto/get-tasks-filtered.dto';
import { TaskRepository } from '../repository/task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entity/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private readonly tasksRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilteredDto): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto);
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto);
  }

  async getTaskById(id: string): Promise<Task> {
    const foundTask = await this.tasksRepository.findOneBy({ id });
    if (!foundTask) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }

    return foundTask;
  }

  async deleteTaskById(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
  }

  async updateTaskStatusById(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
