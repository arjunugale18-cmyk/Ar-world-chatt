import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremium(username: string, isPremium: boolean): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(from: string, to: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPremium(username: string, isPremium: boolean): Promise<void> {
    await db.update(users).set({ isPremium }).where(eq(users.username, username));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(from: string, to: string): Promise<Message[]> {
    return await db.select().from(messages).where(
      or(
        and(eq(messages.fromUsername, from), eq(messages.toUsername, to)),
        and(eq(messages.fromUsername, to), eq(messages.toUsername, from))
      )
    ).orderBy(messages.sentAt);
  }
}

export const storage = new DatabaseStorage();
