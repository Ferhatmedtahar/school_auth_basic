import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
const id = () =>
  text("id")
    .primaryKey()
    .$default(() => randomUUID());

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(checklists),
}));
export const checklists = sqliteTable("checklists", {
  id: id(),
  authorId: text("authorId").notNull(),
  content: text("content").notNull(),
});

export const checklistsRelations = relations(checklists, ({ one }) => ({
  author: one(users, {
    fields: [checklists.authorId],
    references: [users.id],
  }),
}));
