export type Nullable<T> = T | null | undefined;
export type Asyncable<T> = T | Promise<T>;
export type Generous<T> = Nullable<Asyncable<T>>;
// types preset

export type JsonType = Record<string, unknown>;

export type JSONTypes = 'json';
export type StringTypes = 'plain' | 'text' | 'html' | 'css' | 'javascript';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * */
export type ResponseTypes = {
  // JSON Types
  [x in JSONTypes]: JsonType;
} & {
  // String Types
  [x in StringTypes]: string;
};

export type SendType<K extends keyof ResponseTypes = keyof ResponseTypes> = {
  [P in K]: {
    body?: ResponseTypes[P];
    headers?: JsonType;
    type: P;
  };
}[K];
