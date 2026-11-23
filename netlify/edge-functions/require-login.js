const encoder = new TextEncoder();
const salt = encoder.encode('38c5cd180ad2d217f2e5503f2d72615b');
const expected = '63d3f7e751df59fface5aa61aa6652d3c2c6c6f7dc26a68538fa3393233d4cda';

const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Vary': 'X-Quan-Login' };
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
    const response=await fetch('/index.html',{headers:{'X-Quan-Login':credentials},credentials:'omit',cache:'no-store'});
    if(response.headers.get('X-Quan-Game')!=='1'){
      document.getElementById('notice').textContent=response.status===401?'Sai tài khoản hoặc mật khẩu.':'Chưa mở được quán. Vui lòng thử lại.';
      return;
    }
    const html=await response.text();
    form.reset();
    document.open();document.write(html);document.close();
    window.addEventListener('pagehide',()=>{document.documentElement.style.visibility='hidden'});
    window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
  }catch{document.getElementById('notice').textContent='Chưa đăng nhập được. Vui lòng thử lại.'}
  finally{button.disabled=false}
};
</script></html>`;

export default async function requireLogin(request, context) {
  const path = new URL(request.url).pathname;
  if (path !== '/' && path !== '/index.html') {
    if (!/\.(?:css|js|mjs|png|svg|ico|jpg|webp|mp3|wav|ogg|woff2)$/i.test(path) || path.startsWith('/netlify/')) return new Response(null, {status:404});
    const asset = await context.next();
    if ((asset.headers.get('Content-Type') || '').includes('text/html')) return new Response(null, {status:404});
    return asset;
  }
  const token = request.headers.get('X-Quan-Login');
  if (!token || request.method !== 'GET') return new Response(loginPage, {headers});
  let credentials = '';
  try { if (token.length <= 512) credentials = atob(token); } catch {}
  if (credentials.startsWith('admin:')) {
    const key = await crypto.subtle.importKey('raw', encoder.encode(credentials), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations:100000}, key, 256);
    const hash = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2,'0')).join('');
    if (hash === expected) {
      const response = await context.next();
      return new Response(response.body, {status:response.status, headers:{...headers, ...(response.ok ? {'X-Quan-Game':'1'} : {})}});
    }
  }
  return new Response(null, {status:401, headers});
}
export const config = { path:'/*' };
