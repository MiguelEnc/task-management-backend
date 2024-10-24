import { DataSource } from 'typeorm';
import { TaskRepository } from './task.repository';
import { Task } from '../entity/task.entity';
import { User } from '../../auth/entity/user.entity';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../../auth/repository/users.repository';
import { GetTasksFilteredDto } from '../dto/get-tasks-filtered.dto';
import { CreateTaskDto } from '../dto/create-task.dto';

describe('TaskRepository', () => {
    let taskRepository: TaskRepository;
    let userRepository: UsersRepository;
    let sqliteDataSource: DataSource;
    
    let mockUser: User;

    const taskDto: CreateTaskDto = {
        title: 'testTask',
        description: 'dummy description',
    };

    const emptyTasksFilterDto: GetTasksFilteredDto = {
        status: null,
        search: null
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [Task, User],
            synchronize: true,
            // logging: 'all',
            }),
            TypeOrmModule.forFeature([Task, User]),
        ],
        providers: [TaskRepository, UsersRepository],
        }).compile();

        taskRepository = module.get<TaskRepository>(TaskRepository);
        userRepository = module.get<UsersRepository>(UsersRepository);
        sqliteDataSource = module.get<DataSource>(DataSource);

        await userRepository.createUser({ username: 'TestUser', password: 'testPassword' })
        mockUser = await userRepository.findOneBy({ username: 'TestUser' })
    });

    afterEach(async () => {
        if (sqliteDataSource.isInitialized) {
            await sqliteDataSource.dropDatabase();
            await sqliteDataSource.destroy();
        }
    });

    it('should be defined', () => {
        expect(taskRepository).toBeDefined();
        expect(userRepository).toBeDefined();
    });

    describe('createTask', () => {

        it('creates single task', async () => {
            const response = await taskRepository.createTask(taskDto, mockUser);
            expect(response.title).toEqual(taskDto.title);
        });

        it('throws error when trying to create a task without user', async () => {
            expect(taskRepository.createTask({ title: null, description: null }, null)).rejects.toThrow(InternalServerErrorException)
        });
    });

    describe('getTasks', () => {
        it('returns an empty list when no data is stored', async () => {
            const response = await taskRepository.getTasks(emptyTasksFilterDto, mockUser);
            expect(response.length).toBe(0);
        });

        it('returns a list of tasks of a given user', async () => {
            await taskRepository.createTask(taskDto, mockUser);

            const response = await taskRepository.getTasks(emptyTasksFilterDto, mockUser);
            expect(response.at(0).title).toBe(taskDto.title);
        });

        it('returns an empty tasks list when user is null', async () => {
            const response = await taskRepository.getTasks(emptyTasksFilterDto, null);
            expect(response.length).toBe(0);
        });

        it('returns tasks filtered by search', async () => {
            const secondTask = {
                title: 'Test With Specific Title',
                description: 'dummy description'
            };

            const filterDto = {
                search: 'specific'
            }

            await taskRepository.createTask(taskDto, mockUser);
            await taskRepository.createTask(secondTask, mockUser);

            const response = await taskRepository.getTasks(filterDto, mockUser);
            expect(response.length).toBe(1);
            expect(response.at(0).title).toBe(secondTask.title);
        });

        it('return empty list when querying with different user', async () => {
            const mockUser_2 = {
                id: '2',
                username: 'TestUser_2',
                password: 'testPassword_2',
                tasks: [],
            };

            await taskRepository.createTask(taskDto, mockUser);

            const response = await taskRepository.getTasks(emptyTasksFilterDto, mockUser_2);
            expect(response.length).toBe(0);
        });
    });
});
