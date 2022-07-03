import * as cookie from 'cookies-next';

export function set(key: string, value: any): void {
  cookie.setCookie(key, value);
}

export function get(key: string): any {
  return cookie.getCookie(key);
}

export function check(key: string): boolean {
  return cookie.hasCookie(key);
}

export function remove(key: string): void {
  cookie.deleteCookie(key);
}