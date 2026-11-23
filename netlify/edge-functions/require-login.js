const encoder = new TextEncoder();
const salt = encoder.encode('38c5cd180ad2d217f2e5503f2d72615b');
const expected = '63d3f7e751df59fface5aa61aa6652d3c2c6c6f7dc26a68538fa3393233d4cda';

export default async function requireLogin(request, context) {
  const authorization = request.headers.get('Authorization') || '';
  const match = /^Basic ([A-Za-z0-9+/]+=*)$/i.exec(authorization);
  if (match && match[1].length <= 512) {
    let credentials;
    try { credentials = atob(match[1]); } catch { credentials = ''; }
    if (credentials.startsWith('admin:')) {
      const key = await crypto.subtle.importKey('raw', encoder.encode(credentials), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
      const hash = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash === expected) {
        const response = await context.next();
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'private, no-store');
        return new Response(response.body, {status: response.status, headers});
      }
    }
  }
  return new Response('Vui lòng đăng nhập để mở quán.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Quan Nuoc Via He", charset="UTF-8"', 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

export const config = { path: '/*' };
