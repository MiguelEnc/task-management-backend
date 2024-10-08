import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from '../model/task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from '../dto/create-task.dto';
import { DeleteTaskDto, OperationStatus } from '../dto/delete-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;

    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  getTaskById(id: string): Task {
    return this.tasks.find((t) => t.id === id);
  }

  deleteTaskById(id: string): DeleteTaskDto {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    const response: DeleteTaskDto = {
      status: OperationStatus.OK,
    };
    return response;
  }

  updateTaskStatusById(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
