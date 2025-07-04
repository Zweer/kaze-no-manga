import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';

describe('User Model Tests', () => {
  it('should be able to insert a new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
    };
    await db.insert(userTable).values(newUser);
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.email, 'test@example.com'),
    });
    expect(user).toBeDefined();
    expect(user?.name).toBe('Test User');
  });

  it('should be able to query users', async () => {
    const newUser = {
      name: 'Test User 2',
      email: 'test2@example.com',
    };
    await db.insert(userTable).values(newUser);
    const allUsers = await db.query.userTable.findMany();
    expect(allUsers.length).toBeGreaterThanOrEqual(1);
  });

  it('should be able to update a user', async () => {
    const newUser = {
      name: 'Test User 3',
      email: 'test3@example.com',
    };
    const [{ id }] = await db.insert(userTable).values(newUser).returning({ id: userTable.id });
    await db.update(userTable).set({ name: 'Updated Test User 3' }).where(eq(userTable.id, id));
    const updatedUser = await db.query.userTable.findFirst({
      where: eq(userTable.id, id),
    });
    expect(updatedUser?.name).toBe('Updated Test User 3');
  });

  it('should be able to delete a user', async () => {
    const newUser = {
      name: 'Test User 4',
      email: 'test4@example.com',
    };
    const [{ id }] = await db.insert(userTable).values(newUser).returning({ id: userTable.id });
    await db.delete(userTable).where(eq(userTable.id, id));
    const deletedUser = await db.query.userTable.findFirst({
      where: eq(userTable.id, id),
    });
    expect(deletedUser).toBeUndefined();
  });
});
