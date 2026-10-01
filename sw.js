// Service worker: ทำให้ติดตั้งเป็นแอปได้ และเปิดหน้าแอปได้เร็ว (ข้อมูลคิวมาจาก Firebase แบบสดเสมอ ไม่ได้เก็บไว้ที่นี่)
// เปลี่ยน VERSION ทุกครั้งที่แก้ไฟล์หน้าเว็บ เพื่อให้มือถือคนขับได้ของใหม่
const VERSION = 'smartq-driver-v5';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// หน้าแอป: ลองโหลดใหม่จากเน็ตก่อน (ได้เวอร์ชันล่าสุด) ถ้าไม่มีเน็ตค่อยใช้ที่เก็บไว้
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
