/**
 * Represents a class of type T
 */
export type Constructable<T = any> = new (...args: any[]) => T;
