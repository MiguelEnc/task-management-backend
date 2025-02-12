import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './entity/user.entity';

export const GetUser = createParamDecorator(
  (_data, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
