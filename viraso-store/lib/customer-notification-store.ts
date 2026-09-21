import { promises as fs } from "fs";
import path from "path";

export type CustomerNotification = {
  id: string;
  recipient_key: string; // e.g. mobile or email
  title: string;
  message: string;
  inquiry_id?: string;
  is_read: boolean;
  created_at: string;
};

const dataDir = path.join(process.cwd(), "data", "notifications");
const notificationsFile = path.join(dataDir, "notifications.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(notificationsFile);
  } catch {
    await fs.writeFile(notificationsFile, JSON.stringify([], null, 2), "utf8");
  }
}

export async function addCustomerNotification(input: {
  recipient_key: string;
  title: string;
  message: string;
  inquiry_id?: string;
}): Promise<CustomerNotification> {
  await ensureStore();
  let list: CustomerNotification[] = [];
  try {
    const raw = await fs.readFile(notificationsFile, "utf8");
    if (raw) list = JSON.parse(raw);
  } catch {}

  const notification: CustomerNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    recipient_key: input.recipient_key.trim().toLowerCase(),
    title: input.title,
    message: input.message,
    inquiry_id: input.inquiry_id,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  list.unshift(notification);
  await fs.writeFile(notificationsFile, JSON.stringify(list, null, 2), "utf8");
  return notification;
}

export async function getCustomerNotifications(recipientKey: string): Promise<CustomerNotification[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(notificationsFile, "utf8");
    if (!raw) return [];
    const list = JSON.parse(raw) as CustomerNotification[];
    const key = recipientKey.trim().toLowerCase();
    return list.filter((n) => n.recipient_key === key);
  } catch {
    return [];
  }
}
