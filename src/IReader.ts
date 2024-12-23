export interface IReader<T> {
  read(): T | null;
  peek(): T | null;
  rollback(): void;
}
