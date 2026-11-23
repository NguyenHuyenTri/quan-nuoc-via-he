import { getStore } from 'https://esm.sh/@netlify/blobs@10?target=deno&bundle';

const encoder = new TextEncoder();
const salt = encoder.encode('38c5cd180ad2d217f2e5503f2d72615b');
const expected = '63d3f7e751df59fface5aa61aa6652d3c2c6c6f7dc26a68538fa3393233d4cda';

const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' };
const loaderStyle = `<style>
.quan-loading{display:flex;align-items:center;justify-content:center;gap:.7rem;font:600 16px system-ui;color:#fff3d6}
.quan-loading::before{content:"";width:1.1em;height:1.1em;border:3px solid #546b5e;border-top-color:#ffda91;border-radius:50%;animation:quan-spin .8s linear infinite}
@keyframes quan-spin{to{transform:rotate(1turn)}}
#quan-arrival{position:fixed;inset:0;z-index:2147483647;background:#11251e;pointer-events:none;animation:quan-enter .6s ease-out forwards}
@keyframes quan-enter{0%,60%{opacity:1}100%{opacity:0;visibility:hidden}}
@media(prefers-reduced-motion:reduce){.quan-loading::before{animation:none}#quan-arrival{animation-duration:.15s}}
</style>`;
const arrival = '<div id="quan-arrival" class="quan-loading" role="status">Đang vào quán…</div><script>document.getElementById("quan-arrival").addEventListener("animationend",function(e){if(e.target===this)this.remove()})</script>';
const loginPage = (message = '') => `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đăng nhập · Quán Nước Vỉa Hè</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#11251e;color:#fff3d6;font:16px system-ui}form{width:min(90vw,350px);padding:24px;background:#20382e;border-radius:14px}label,input,button{display:block;width:100%}input,button{margin:6px 0 16px;padding:12px;border-radius:8px;font:inherit}button{background:#ffda91;cursor:pointer}</style>
${loaderStyle}<form id="login" method="post" action="/"><h2>Quán Nước Vỉa Hè</h2><label>Tài khoản<input name="username" required autocomplete="username" autocapitalize="none"></label><label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required></label><button>Đăng nhập</button><p role="status" id="notice">${message}</p></form>
<script>
const form=document.getElementById('login');
form.addEventListener('submit',()=>{
  form.querySelector('button').disabled=true;
  const notice=document.getElementById('notice');
  notice.classList.add('quan-loading');
  notice.textContent='Đang đăng nhập…';
});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
</script></html>`;

const lifetime = 24 * 60 * 60;
const cookieName = '__Host-quan_session';

async function signingKey() {
  const store = getStore({name:'quan-auth', consistency:'strong'});
  let secret = await store.get('session-key');
  if (!secret) {
    const random = crypto.getRandomValues(new Uint8Array(32));
    const proposed = btoa(String.fromCharCode(...random));
    const {modified} = await store.set('session-key', proposed, {onlyIfNew:true});
    secret = modified ? proposed : await store.get('session-key');
  }
  if (!secret) throw new Error('Session key unavailable');
  return crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']);
}
async function sessionExpiry(request) {
  const value = (request.headers.get('Cookie') || '').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const match = /^(\d{10})\.([a-f0-9]{64})$/.exec(value || '');
  if (!match || Number(match[1]) <= Date.now()/1000) return 0;
  const signature = Uint8Array.from(match[2].match(/../g), pair=>parseInt(pair,16));
  return await crypto.subtle.verify('HMAC',await signingKey(),signature,encoder.encode(match[1])) ? Number(match[1]) : 0;
}
export default async function requireLogin(request, context) {
  const path = new URL(request.url).pathname;
  if (path !== '/' && path !== '/index.html') {
    if (!/\.(?:css|js|mjs|png|svg|ico|jpg|webp|mp3|wav|ogg|woff2)$/i.test(path) || path.startsWith('/netlify/')) return new Response(null, {status:404});
    const asset = await context.next();
    if ((asset.headers.get('Content-Type') || '').includes('text/html')) return new Response(null, {status:404});
    return asset;
  }
  if (request.method === 'GET' || request.method === 'HEAD') {
    const expiry = await sessionExpiry(request);
    if (!expiry) {
      const message = new URL(request.url).searchParams.has('vao-quan') ? 'Đăng nhập đúng nhưng trình duyệt chưa gửi lại cookie. Hãy cho phép cookie của trang quán rồi thử lại.' : '';
      return new Response(loginPage(message), {headers});
    }
    if (new URL(request.url).searchParams.has('vao-quan')) {
      return new Response(null,{status:303,headers:{...headers,Location:'/'}});
    }
    const response = await context.next();
    const guard = '<script>(()=>{const expires='+expiry+'*1000;function check(){if(Date.now()>=expires)location.reload()}setTimeout(check,Math.max(0,expires-Date.now())+100);addEventListener("pageshow",check);document.addEventListener("visibilitychange",check)})();</script>';
    const html = (await response.text()).replace('</head>',loaderStyle+guard+'</head>').replace(/<body\b[^>]*>/i, tag=>tag+arrival);
    return new Response(html,{status:response.status,headers});
  }
  if (request.method !== 'POST') return new Response(null,{status:405,headers:{Allow:'GET, HEAD, POST'}});
  if (request.headers.get('Origin') !== new URL(request.url).origin) return new Response(null,{status:403,headers});
  const fields = await request.formData().catch(()=>null);
  const password = fields?.get('password');
  if (fields?.get('username') === 'admin' && typeof password === 'string' && password.length <= 256) {
    const credentials = 'admin:'+password;
    const key = await crypto.subtle.importKey('raw', encoder.encode(credentials), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations:100000}, key, 256);
    const hash = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2,'0')).join('');
    if (hash === expected) {
      const expiry = String(Math.floor(Date.now()/1000)+lifetime);
      const bytes = await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(expiry));
      const signature = Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
      return new Response(null,{status:303,headers:{...headers,Location:'/?vao-quan=1','Set-Cookie':cookieName+'='+expiry+'.'+signature+'; Path=/; Max-Age='+lifetime+'; Secure; HttpOnly; SameSite=Lax'}});
    }
  }
  return new Response(loginPage('Sai tài khoản hoặc mật khẩu.'), {status:401, headers});
}
export const config = { path:'/*' };
