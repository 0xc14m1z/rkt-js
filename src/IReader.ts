export interface IReader {
  read(): string | null;
  peek(): string | null;
  rollback(): void;
}
