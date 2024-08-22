import type { JsonType, ResponseTypes, SendType } from '../types';

/**
 * `SentaResponse` is a type-safe response instance.
 *
 * Supported format types
 * ```ts
 * export type JSONTypes = 'json';
 * export type StringTypes = 'plain' | 'text' | 'html' | 'css' | 'javascript';
 * ```
 * @example
 * ```ts
 * const a = new SentaResponse({
 *   type: "json",
 *   body: {foo: "bar"}
 * }); // ok!
 *
 * const b = new SentaResponse({
 *   type: "plain",
 *   body: {foo: "bar"}
 * }); // ERROR! Type '{}' is not assignable to type 'string'.
 * ```
 */
export class SentaResponse {
  body: any;

  headers: JsonType;

  type: keyof ResponseTypes;

  constructor(response: SendType) {
    if (!['json', 'plain', 'text', 'html', 'css', 'javascript'].includes(response.type)) {
      throw new Error(`Invalid response type: ${response.type}`);
    }
    this.body = response.body;
    this.headers = response.headers || {};
    this.headers['Content-Type'] = response.type;
    this.type = response.type;
  }

  format() {
    switch (this.type) {
      case 'json':
        return JSON.stringify(this.body);
      default:
        return String(this.body);
    }
  }
}
