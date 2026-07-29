declare module "node:sqlite" {
  export class StatementSync {
    all<T extends object = Record<string, unknown>>(...params: Array<string | number | null | Uint8Array>): T[];
    get<T extends object = Record<string, unknown>>(...params: Array<string | number | null | Uint8Array>): T | undefined;
    run(...params: Array<string | number | null | Uint8Array>): void;
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
