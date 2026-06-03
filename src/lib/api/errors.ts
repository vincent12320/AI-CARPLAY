export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function logDbError(context: string, err: unknown): void {
  console.error(`[DB] ${context}:`, err);
}
