import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { User, UsersData } from "./ticket-types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "users.json");

function defaultUsersData(): UsersData {
  return {
    users: [
      { id: "RABARR", name: "R. Abarr", isAdmin: true },
      { id: "JNGEASH", name: "J. Ngeash", isAdmin: true },
    ],
  };
}

export async function readUsers(): Promise<UsersData> {
  try {
    const raw = await readFile(USERS_PATH, "utf-8");
    return JSON.parse(raw) as UsersData;
  } catch {
    const data = defaultUsersData();
    await writeUsers(data);
    return data;
  }
}

export async function writeUsers(data: UsersData): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(USERS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAllUsers(): Promise<User[]> {
  const data = await readUsers();
  return data.users;
}

export async function getAdminUsers(): Promise<User[]> {
  const data = await readUsers();
  return data.users.filter((u) => u.isAdmin);
}

export async function getUser(userId: string): Promise<User | null> {
  const data = await readUsers();
  return data.users.find((u) => u.id === userId) || null;
}

export async function createUser(
  id: string,
  name: string,
  isAdmin: boolean = false
): Promise<User> {
  const data = await readUsers();

  // Check if user already exists
  const existing = data.users.find((u) => u.id === id);
  if (existing) {
    throw new Error(`User with ID "${id}" already exists`);
  }

  const user: User = { id, name, isAdmin };
  data.users.push(user);
  await writeUsers(data);
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id">>
): Promise<User | null> {
  const data = await readUsers();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return null;

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.isAdmin !== undefined) user.isAdmin = updates.isAdmin;

  await writeUsers(data);
  return user;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const data = await readUsers();
  const index = data.users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  data.users.splice(index, 1);
  await writeUsers(data);
  return true;
}
