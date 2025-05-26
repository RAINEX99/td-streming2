import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStreamingAccountSchema, updateStreamingAccountSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all streaming accounts with optional filters
  app.get("/api/accounts", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        platform: req.query.platform as string,
        accountType: req.query.accountType as string,
        status: req.query.status as string,
      };

      const accounts = await storage.getStreamingAccounts(filters);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Error fetching accounts" });
    }
  });

  // Get account statistics
  app.get("/api/accounts/statistics", async (req, res) => {
    try {
      const stats = await storage.getAccountStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });

  // Get single account by ID
  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }

      const account = await storage.getStreamingAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ message: "Error fetching account" });
    }
  });

  // Create new account
  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertStreamingAccountSchema.parse(req.body);
      const account = await storage.createStreamingAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Error creating account" });
    }
  });

  // Update account
  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }

      const validatedData = updateStreamingAccountSchema.parse(req.body);
      const account = await storage.updateStreamingAccount(id, validatedData);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Error updating account" });
    }
  });

  // Delete account
  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }

      const deleted = await storage.deleteStreamingAccount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Error deleting account" });
    }
  });

  // Database health check
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection by fetching statistics
      await storage.getAccountStatistics();
      res.json({ status: "connected", database: "postgresql" });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(503).json({ status: "disconnected", error: error.message });
    }
  });

  // Export accounts as JSON
  app.get("/api/accounts/export/json", async (req, res) => {
    try {
      const accounts = await storage.getStreamingAccounts();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="streaming_accounts.json"');
      res.json(accounts);
    } catch (error) {
      console.error("Error exporting accounts:", error);
      res.status(500).json({ message: "Error exporting accounts" });
    }
  });

  // Import accounts from JSON
  app.post("/api/accounts/import", async (req, res) => {
    try {
      const { accounts } = req.body;
      
      if (!Array.isArray(accounts)) {
        return res.status(400).json({ message: "Invalid import format. Expected array of accounts." });
      }

      const importedAccounts = [];
      const errors = [];

      for (let i = 0; i < accounts.length; i++) {
        try {
          const validatedData = insertStreamingAccountSchema.parse(accounts[i]);
          const account = await storage.createStreamingAccount(validatedData);
          importedAccounts.push(account);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        imported: importedAccounts.length,
        errors: errors.length,
        errorDetails: errors
      });
    } catch (error) {
      console.error("Error importing accounts:", error);
      res.status(500).json({ message: "Error importing accounts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
