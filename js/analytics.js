import { doc, updateDoc, collection, addDoc, query, orderBy, getDocs, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './authManager.js';

const VISITOR_ID_KEY = 'myweb_visitor_id';
const VISIT_DOC_ID_KEY = 'myweb_visit_doc_id';

// 1. ฟังก์ชันเริ่มเก็บสถิติ (รันครั้งเดียวตอนโหลดหน้าเว็บ)
export const initAnalytics = async () => {
    try {
        let visitorId = localStorage.getItem(VISITOR_ID_KEY);
        if (!visitorId) {
            visitorId = 'User_' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
        }
        
        let docId = sessionStorage.getItem(VISIT_DOC_ID_KEY);
        
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
            const docRef = doc(db, 'page_visits', docId);
            await updateDoc(docRef, {
                lastActiveTime: new Date().toISOString()
            });
        }
        
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
