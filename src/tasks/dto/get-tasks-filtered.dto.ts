import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../model/task.model';

export class GetTasksFilteredDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
