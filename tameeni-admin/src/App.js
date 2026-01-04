import React, { useState, useEffect } from 'react';
import axios from 'axios';

// تأكد أن الرابط ينتهي بـ /api/admin ليتناسب مع تحديث الـ server.js الأخير
const API_BASE = "https://tameeni-project.onrender.com/api/admin";

// ضع هنا نفس المفتاح الذي وضعته في إعدادات Render (ADMIN_SECRET)
const ADMIN_SECRET_KEY = "Baraa@2026"; 

function AdminApp() {
  const [apps, setApps] = useState([]);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // حماية الواجهة الأمامية بكلمة مرور بسيطة
  const handleLogin = () => {
    if (password === "123456") { // كلمة مرور دخول الصفحة
      setIsLoggedIn(true);
    } else {
      alert("كلمة المرور خطأ!");
    }
  };

  // جلب البيانات مع إرسال المفتاح في الـ Headers
  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/applications`, {
        headers: { 'x-admin-secret': ADMIN_SECRET_KEY }
      });
      setApps(res.data);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
      alert("فشل جلب البيانات. تأكد من صحة مفتاح الأمان ADMIN_SECRET");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchApps();
  }, [isLoggedIn]);

  // تحديث الحالة مع إرسال المفتاح في الـ Headers
  const updateStatus = async (id, step, status) => {
    const comment = prompt("أدخل ملاحظة للعميل:");
    try {
      await axios.patch(`${API_BASE}/applications/${id}/step`, 
      { step, status, comment }, 
      {
        headers: { 'x-admin-secret': ADMIN_SECRET_KEY }
      });
      fetchApps(); // تحديث القائمة بعد التعديل
    } catch (err) {
      alert("حدث خطأ أثناء التحديث.");
    }
  };

  // شاشة الدفع (Login)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 text-center border border-gray-700">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold mb-6 italic">لوحة تحكم المؤمن</h2>
          <input 
            type="password" 
            placeholder="كلمة مرور المسؤول" 
            className="w-full p-3 rounded bg-gray-700 mb-4 outline-none border border-gray-600 focus:border-blue-500 transition" 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700 transition transform active:scale-95"
          >
            دخول النظام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-right font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 border-r-4 border-blue-600 pr-4">إدارة طلبات العملاء</h1>
          <button onClick={fetchApps} className="bg-white border text-gray-600 px-4 py-2 rounded shadow hover:bg-gray-50">تحديث القائمة 🔄</button>
        </div>

        {loading ? (
          <div className="text-center p-20 text-gray-400">جاري تحميل البيانات...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-4 border-b">اسم العميل</th>
                  <th className="p-4 border-b">الهوية (الخطوة 1)</th>
                  <th className="p-4 border-b">المركبة (الخطوة 2)</th>
                  <th className="p-4 border-b">الدفع (الخطوة 3)</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 && (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-400">لا توجد طلبات معالجة حالياً</td></tr>
                )}
                {apps.map(app => (
                  <tr key={app._id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-4 font-bold text-gray-700">
                      {app.fullName}
                      <div className="text-[10px] text-gray-400 font-light mt-1">{new Date(app.createdAt).toLocaleString('ar-SA')}</div>
                    </td>
                    
                    {/* خطوات التحكم لكل عميل */}
                    {['step1', 'step2', 'step3'].map((stepKey) => (
                      <td key={stepKey} className="p-4 border-r border-l">
                        <div className="flex flex-col gap-2">
                          <div className={`text-[10px] py-1 px-2 rounded-full text-center font-bold ${getStatusStyle(app.steps[stepKey].status)}`}>
                            {translateStatus(app.steps[stepKey].status)}
                          </div>
                          <div className="flex justify-center gap-2">
                            <button onClick={() => updateStatus(app._id, stepKey, 'Approved')} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-600 hover:text-white transition">✅ قبول</button>
                            <button onClick={() => updateStatus(app._id, stepKey, 'Rejected')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition">❌ رفض</button>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// وظائف مساعدة للتنسيق
function getStatusStyle(status) {
  if (status === 'Approved') return 'bg-green-100 text-green-700';
  if (status === 'Rejected') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

function translateStatus(status) {
  if (status === 'Approved') return 'مقبول';
  if (status === 'Rejected') return 'مرفوض';
  return 'قيد الانتظار';
}

export default AdminApp;
