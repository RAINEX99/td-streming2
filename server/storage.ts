import { streamingAccounts, type StreamingAccount, type InsertStreamingAccount, type UpdateStreamingAccount } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  // Streaming Accounts
  getStreamingAccounts(filters?: {
    search?: string;
    platform?: string;
    accountType?: string;
    status?: string;
  }): Promise<StreamingAccount[]>;
  getStreamingAccount(id: number): Promise<StreamingAccount | undefined>;
  createStreamingAccount(account: InsertStreamingAccount): Promise<StreamingAccount>;
  updateStreamingAccount(id: number, account: UpdateStreamingAccount): Promise<StreamingAccount | undefined>;
  deleteStreamingAccount(id: number): Promise<boolean>;
  getAccountStatistics(): Promise<{
    total: number;
    active: number;
    expiring: number;
    expired: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getStreamingAccounts(filters?: {
    search?: string;
    platform?: string;
    accountType?: string;
    status?: string;
  }): Promise<StreamingAccount[]> {
    let query = db.select().from(streamingAccounts);
    
    const conditions = [];
    
    if (filters?.search) {
      conditions.push(ilike(streamingAccounts.clientName, `%${filters.search}%`));
    }
    
    if (filters?.platform) {
      conditions.push(eq(streamingAccounts.platform, filters.platform));
    }
    
    if (filters?.accountType) {
      conditions.push(eq(streamingAccounts.accountType, filters.accountType));
    }
    
    if (filters?.status) {
      conditions.push(eq(streamingAccounts.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async getStreamingAccount(id: number): Promise<StreamingAccount | undefined> {
    const [account] = await db.select().from(streamingAccounts).where(eq(streamingAccounts.id, id));
    return account || undefined;
  }

  async createStreamingAccount(account: InsertStreamingAccount): Promise<StreamingAccount> {
    const [newAccount] = await db
      .insert(streamingAccounts)
      .values({
        ...account,
        updatedAt: new Date(),
      })
      .returning();
    return newAccount;
  }

  async updateStreamingAccount(id: number, account: UpdateStreamingAccount): Promise<StreamingAccount | undefined> {
    const [updatedAccount] = await db
      .update(streamingAccounts)
      .set({
        ...account,
        updatedAt: new Date(),
      })
      .where(eq(streamingAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteStreamingAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(streamingAccounts)
      .where(eq(streamingAccounts.id, id));
    return result.rowCount > 0;
  }

  async getAccountStatistics(): Promise<{
    total: number;
    active: number;
    expiring: number;
    expired: number;
  }> {
    const accounts = await this.getStreamingAccounts();
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const total = accounts.length;
    let active = 0;
    let expiring = 0;
    let expired = 0;

    accounts.forEach(account => {
      const expirationDate = new Date(account.expirationDate);
      
      if (expirationDate < now) {
        expired++;
      } else if (expirationDate <= oneWeekFromNow) {
        expiring++;
      } else {
        active++;
      }
    });

    return { total, active, expiring, expired };
  }
}

export const storage = new DatabaseStorage();
