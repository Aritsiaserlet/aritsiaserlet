# คู่มือการสร้างระบบเก็บสถิติผู้เข้าชมเว็บไซต์ (Analytics) ด้วย Firebase & Vanilla JS

คู่มือนี้สำหรับนำไปติดตั้งระบบเก็บสถิติใน **โปรเจกต์อื่นๆ** ที่ใช้งาน HTML, JavaScript (Vanilla/ES6) และ Firebase Firestore.

## สิ่งที่ระบบนี้ทำได้:
1. เก็บ **รหัสผู้ใช้งาน (Visitor ID)** แบบสุ่ม (จำค่าด้วย LocalStorage)
2. เก็บ **เวลาเข้าเว็บไซต์ (Start Time)** และ **เวลาใช้งานล่าสุด (Last Active Time)**
3. เก็บข้อมูล **การคลิกดูผลงาน (Portfolios Clicked)** ของผู้ใช้รายนั้นๆ
4. มี **หน้า Admin Dashboard** เพื่อดูข้อมูลทั้งหมดแบบตาราง

---

## ขั้นตอนที่ 1: ตั้งค่า Firestore Rules
ไปที่ Firebase Console (หรือแก้ไขไฟล์ `firestore.rules` ในโปรเจกต์) เพื่ออนุญาตให้ระบบอ่านและเขียนข้อมูลลง Collection `page_visits` ได้

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... rules อื่นๆ ของคุณ ...

    // เพิ่ม rule นี้เพื่ออนุญาตการอ่านและเขียนสถิติการเข้าชม
    match /page_visits/{visitId} {
      allow read, write: if true;
    }
  }
}
```

---

## ขั้นตอนที่ 2: สร้างไฟล์ Analytics Service
สร้างไฟล์ `src/services/analytics.js` (หรือโฟลเดอร์ตามที่คุณจัดระเบียบไว้) และใส่โค้ดด้านล่าง:
*หมายเหตุ: อย่าลืมแก้พาธ `import { db } from '../main.js';` ให้ตรงกับไฟล์ที่ export `db` ของ Firebase ของโปรเจกต์คุณ*

```javascript
import { doc, updateDoc, collection, addDoc, query, orderBy, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../main.js'; // เปลี่ยนเป็นพาธ firebase.js ของโปรเจกต์คุณ

const VISITOR_ID_KEY = 'myweb_visitor_id';
const VISIT_DOC_ID_KEY = 'myweb_visit_doc_id';

// 1. ฟังก์ชันเริ่มเก็บสถิติ (รันครั้งเดียวตอนโหลดหน้าเว็บ)
export const initAnalytics = async () => {
    try {
        // สร้าง Visitor ID แบบสุ่ม ถ้ายังไม่มี
        let visitorId = localStorage.getItem(VISITOR_ID_KEY);
        if (!visitorId) {
            visitorId = 'User_' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
        }
        
        let docId = sessionStorage.getItem(VISIT_DOC_ID_KEY);
        
        // ถ้าเป็น Session ใหม่ ให้สร้าง Document ใหม่
        if (!docId) {
            const visitsRef = collection(db, 'page_visits');
            const docRef = await addDoc(visitsRef, {
                visitorId,
                startTime: new Date().toISOString(),
                lastActiveTime: new Date().toISOString(),
                portfoliosClicked: []
            });
            docId = docRef.id;
            sessionStorage.setItem(VISIT_DOC_ID_KEY, docId);
        } else {
            // ถ้ามีการ Reload หน้าเว็บ ให้อัปเดตเวลาล่าสุดทันที
            const docRef = doc(db, 'page_visits', docId);
            await updateDoc(docRef, {
                lastActiveTime: new Date().toISOString()
            });
        }
        
        // 2. อัปเดตเวลา Active ทุกๆ 30 วินาที
        setInterval(async () => {
             const currentDocId = sessionStorage.getItem(VISIT_DOC_ID_KEY);
             if (currentDocId) {
                 try {
                     const ref = doc(db, 'page_visits', currentDocId);
                     await updateDoc(ref, { lastActiveTime: new Date().toISOString() });
                 } catch(e) {}
             }
        }, 30000);
        
    } catch(e) {
        console.warn("Analytics init error", e);
    }
};

// 3. ฟังก์ชันบันทึกการคลิกดูผลงาน
export const trackPortfolioClick = async (portfolioName) => {
    try {
        const docId = sessionStorage.getItem(VISIT_DOC_ID_KEY);
        if (docId) {
            const ref = doc(db, 'page_visits', docId);
            await updateDoc(ref, {
                portfoliosClicked: arrayUnion(portfolioName)
            });
        }
    } catch(e) {
        console.warn("Tracking click error", e);
    }
};

// ทำให้ HTML ปกติเรียกใช้ได้ผ่าน onclick
window.trackPortfolioClick = trackPortfolioClick;

// 4. ฟังก์ชันสำหรับดึงข้อมูลไปแสดงในหน้า Admin
export const getAdminStats = async () => {
    try {
        const visitsRef = collection(db, 'page_visits');
        const q = query(visitsRef, orderBy('startTime', 'desc'));
        const snapshot = await getDocs(q);
        const data = [];
        snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
        return data;
    } catch(e) {
        console.error("Get admin stats error", e);
        return [];
    }
};
```

---

## ขั้นตอนที่ 3: เริ่มทำงาน Analytics ตอนเว็บโหลด
ในไฟล์หลักที่ใช้เริ่มแอปของคุณ (เช่น `main.js` หรือ `app.js`) ให้ import ฟังก์ชันมาทำงาน:

```javascript
import { initAnalytics } from './services/analytics.js';

// เรียกให้ระบบเก็บสถิติเริ่มทำงาน
initAnalytics();
```

---

## ขั้นตอนที่ 4: การนำไปใช้กับปุ่ม "ผลงาน" (HTML)
เนื่องจากเราประกาศ `window.trackPortfolioClick` ไว้แล้ว คุณสามารถไปใส่ใน HTML ได้ทันที:

```html
<!-- ตัวอย่างปุ่ม -->
<button onclick="window.trackPortfolioClick('ชื่อผลงานที่ 1')">
    กดดูผลงานที่ 1
</button>

<!-- ตัวอย่างลิงก์ -->
<a href="/work-2" onclick="window.trackPortfolioClick('โปรเจกต์ E-Commerce')">
    ดูรายละเอียดโปรเจกต์
</a>
```

---

## ขั้นตอนที่ 5: โค้ดสำหรับหน้า Admin (AdminStatsView)
คุณสามารถสร้างไฟล์ `AdminStatsView.js` (รองรับ Tailwind CSS) เพื่อดึงข้อมูลมาแสดงผล

```javascript
import { getAdminStats } from '../services/analytics.js';

export class AdminStatsView {
    constructor() {
        this.stats = [];
        this.isLoading = true;
    }

    async fetchStats() {
        this.isLoading = true;
        this.renderData();
        this.stats = await getAdminStats();
        this.isLoading = false;
        this.renderData();
    }

    formatDate(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    calculateDuration(start, end) {
        if (!start || !end) return '-';
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        
        if (diffMs < 60000) return `${Math.max(1, Math.floor(diffMs / 1000))} วินาที`;
        
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours} ชั่วโมง ${minutes % 60} นาที`;
        return `${minutes} นาที`;
    }

    attachEvents() {
        this.fetchStats();
        document.getElementById('admin-refresh-btn')?.addEventListener('click', () => this.fetchStats());
    }

    renderData() {
        const tbody = document.getElementById('admin-stats-tbody');
        if (!tbody) return;

        if (this.isLoading) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8">กำลังโหลดข้อมูล...</td></tr>`;
            return;
        }

        if (this.stats.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8">ยังไม่มีข้อมูลผู้เข้าชม</td></tr>`;
            return;
        }

        tbody.innerHTML = this.stats.map(stat => {
            const portfolios = stat.portfoliosClicked || [];
            let portfolioHtml = '<span class="text-gray-500">ไม่มี</span>';
            
            // โค้ดสร้าง Tooltip โชว์รายชื่อผลงาน
            if (portfolios.length > 0) {
                const listHtml = portfolios.map(p => `<li>• ${p}</li>`).join('');
                portfolioHtml = `
                    <div class="relative group inline-block">
                        <button class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-xs font-medium">
                            ดูผลงาน (${portfolios.length})
                        </button>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 shadow-xl pointer-events-none">
                            <ul class="space-y-1 text-left">${listHtml}</ul>
                        </div>
                    </div>
                `;
            }

            return `
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-6 text-sm font-medium">${stat.visitorId}</td>
                    <td class="py-4 px-6 text-sm text-gray-500">${this.formatDate(stat.startTime)}</td>
                    <td class="py-4 px-6 text-sm text-blue-600">${this.calculateDuration(stat.startTime, stat.lastActiveTime)}</td>
                    <td class="py-4 px-6 text-center">${portfolioHtml}</td>
                </tr>
            `;
        }).join('');
    }

    render() {
        return `
            <div class="p-8 font-sans max-w-5xl mx-auto">
                <div class="flex items-center justify-between mb-8">
                    <h1 class="text-3xl font-bold">สถิติผู้เข้าชมเว็บไซต์</h1>
                    <button id="admin-refresh-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        รีเฟรชข้อมูล
                    </button>
                </div>

                <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b">
                                <th class="py-4 px-6 font-semibold">ใครเข้าชม (Visitor ID)</th>
                                <th class="py-4 px-6 font-semibold">เวลาที่เข้าชม</th>
                                <th class="py-4 px-6 font-semibold">ระยะเวลาที่อยู่</th>
                                <th class="py-4 px-6 font-semibold text-center">ผลงานที่กดดู</th>
                            </tr>
                        </thead>
                        <tbody id="admin-stats-tbody">
                            <!-- จะถูกเติมอัตโนมัติจาก renderData() -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}
```

และอย่าลืมนำ `AdminStatsView` ไปใส่ในระบบ Router ของคุณตามปกติครับ
