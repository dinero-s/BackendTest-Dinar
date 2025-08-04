import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteShareLink } from '../notes/shares/entities/note-share.entity';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'example',
  database: 'db_main',
  entities: [User, Note, NoteShareLink],
  synchronize: false,
  logging: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Коннект с БД');

    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = AppDataSource.manager.create(User, {
      email: 'demo@gmail.com',
      passwordHash,
    });
    await AppDataSource.manager.save(user);
    console.log('Демо пользователь создан:', user.email);

    const notesData = [
      { title: 'Первая заметка', body: 'Содержимое заметки № 1' },
      { title: 'Вторая заметка', body: 'Содержимое заметки № 2' },
      { title: 'Третья заметка', body: 'Содержимое заметки № 3' },
    ];

    for (const data of notesData) {
      try {
        const note = AppDataSource.getRepository(Note).create({
          ...data,
          userId: user.id,
        });
        await AppDataSource.getRepository(Note).save(note);
        console.log(`"${note.title}" создана`);
      } catch (error) {
        if (error.code === '23505') {
          throw new ConflictException(
            'Заметка с таким заголовком уже существует',
          );
        }
        if (error.code === '23503') {
          throw new BadRequestException('Некорректный ID пользователя');
        }
        throw new InternalServerErrorException('Ошибка при создании заметки');
      }
    }

    console.log('Seed успешно завершён');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении seed:', error);
    process.exit(1);
  }
}

seed();