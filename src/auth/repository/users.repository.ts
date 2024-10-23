import { DataSource, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository extends Repository<User> {
  private logger = new Logger('UsersRepository', { timestamp: true });

  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ username, password: hashedPassword });
    
    try {
      await this.save(user);
      this.logger.log(`New username created: ${username}`);
    } catch (error) {
      this.logger.error(`Failed to create new user: ${username}`, error?.stack);
    }
  }
}
