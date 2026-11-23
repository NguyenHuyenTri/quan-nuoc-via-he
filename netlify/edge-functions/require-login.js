import { getStore } from 'npm:@netlify/blobs@10';

const encoder = new TextEncoder();
const salt = encoder.encode('38c5cd180ad2d217f2e5503f2d72615b');
const expected = '63d3f7e751df59fface5aa61aa6652d3c2c6c6f7dc26a68538fa3393233d4cda';

const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Vary': 'Cookie, X-Quan-Login' };
const loginPage = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đăng nhập · Quán Nước Vỉa Hè</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#11251e;color:#fff3d6;font:16px system-ui}form{width:min(90vw,350px);padding:24px;background:#20382e;border-radius:14px}label,input,button{display:block;width:100%}input,button{margin:6px 0 16px;padding:12px;border-radius:8px;font:inherit}button{background:#ffda91;cursor:pointer}</style>
<form id="login" method="post" autocomplete="off"><h2>Quán Nước Vỉa Hè</h2><label>Tài khoản<input name="username" required autocapitalize="none"></label><label>Mật khẩu<input name="password" type="password" required></label><button>Đăng nhập</button><p role="status" id="notice"></p></form>
<script>
const form=document.getElementById('login');
form.onsubmit=async event=>{
  event.preventDefault();
  const button=form.querySelector('button');
  button.disabled=true;
  try {
    const credentials=btoa(form.username.value+':'+form.password.value);
    const response=await fetch('/index.html',{headers:{'X-Quan-Login':credentials},credentials:'same-origin',cache:'no-store'});
    if(response.headers.get('X-Quan-Game')!=='1'){
      document.getElementById('notice').textContent=response.status===401?'Sai tài khoản hoặc mật khẩu.':'Chưa mở được quán. Vui lòng thử lại.';
      return;
    }
    form.reset();
    location.replace(location.href);
  }catch{document.getElementById('notice').textContent='Chưa đăng nhập được. Vui lòng thử lại.'}
  finally{button.disabled=false}
};
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
  const token = request.headers.get('X-Quan-Login');
  if (!token || request.method !== 'GET') {
    const expiry = await sessionExpiry(request);
    if (!expiry) return new Response(loginPage, {headers});
    const response = await context.next();
    const guard = '<script>(()=>{const expires='+expiry+'*1000;function check(){if(Date.now()>=expires)location.reload()}setTimeout(check,Math.max(0,expires-Date.now())+100);addEventListener("pageshow",check);document.addEventListener("visibilitychange",check)})();</script>';
    const html = (await response.text()).replace('</head>',guard+'</head>');
    return new Response(html,{status:response.status,headers});
  }
  let credentials = '';
  try { if (token.length <= 512) credentials = atob(token); } catch {}
  if (credentials.startsWith('admin:')) {
    const key = await crypto.subtle.importKey('raw', encoder.encode(credentials), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations:100000}, key, 256);
    const hash = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2,'0')).join('');
    if (hash === expected) {
      const expiry = String(Math.floor(Date.now()/1000)+lifetime);
      const bytes = await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(expiry));
      const signature = Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
      return new Response(null,{status:204,headers:{...headers,'X-Quan-Game':'1','Set-Cookie':cookieName+'='+expiry+'.'+signature+'; Path=/; Max-Age='+lifetime+'; Secure; HttpOnly; SameSite=Strict'}});
    }
  }
  return new Response(null, {status:401, headers});
}
export const config = { path:'/*' };
