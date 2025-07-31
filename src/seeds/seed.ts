import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Note } from '../notes/entities/note.entity';
import * as bcrypt from 'bcrypt';
import { NoteShareLink } from '../notes/shares/entities/note-share.entity';

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
    console.log('🔌 Connected to DB');

    // 1. Создание демо-пользователя
    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = AppDataSource.manager.create(User, {
      email: 'demo@gmail.com',
      passwordHash,
    });
    await AppDataSource.manager.save(user);
    console.log('👤 Demo user created:', user.email);

    // 2. Создание заметок
    const notesData = [
      { title: 'Первая заметка', body: 'Содержимое первой заметки' },
      { title: 'Вторая заметка', body: 'В этой заметке больше текста' },
      { title: 'Третья заметка', body: 'Ещё одна заметка для теста' },
    ];

    for (const data of notesData) {
      const note = AppDataSource.manager.create(Note, {
        ...data,
        user,
        userId: user.id,
      });
      await AppDataSource.manager.save(note);
      console.log('📝 Note created:', note.title);
    }

    console.log('✅ Seed completed successfully');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await AppDataSource.destroy();
    console.log('🛑 Connection closed');
  }
}

seed();
