import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ملاحظة: تأكد من تغيير هذا الرابط في إعدادات Vercel إلى رابط الـ Backend الخاص بك على Render
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', carPlate: '' });
  const [myApplication, setMyApplication] = useState(null);

  // جلب البيانات للأدمن
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/applications`);
      setApps(res.data);
    } catch (err) {
      console.error("خطأ في جلب البيانات", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchApplications();
  }, [isAdmin]);

  // تقديم طلب جديد للعميل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/apply`, formData);
      setMyApplication(res.data);
      alert("تم إرسال طلبك بنجاح! يمكنك الآن متابعة حالة القبول.");
    } catch (err) {
      alert("حدث خطأ أثناء إرسال الطلب.");
    }
    setLoading(false);
  };

  // تحديث حالة الخطوة (للأدمن)
  const handleUpdateStatus = async (id, step, status) => {
    const comment = prompt("أدخل سبب الرفض أو ملاحظة القبول:");
    try {
      await axios.patch(`${API_BASE}/applications/${id}/step`, { step, status, comment });
      fetchApplications(); // تحديث القائمة بعد التعديل
    } catch (err) {
      alert("فشل تحديث الحالة.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold italic text-xl">T</div>
          <h1 className="text-2xl font-bold text-blue-900">تأميني <span className="text-sm font-light text-gray-500">Clone</span></h1>
        </div>
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`px-6 py-2 rounded-full transition ${isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-800 text-white'}`}
        >
          {isAdmin ? "الخروج من لوحة التحكم" : "دخول الأدمن"}
        </button>
      </header>

      <main className="container mx-auto p-6">
        {isAdmin ? (
          /* --- لوحة تحكم الأدمن --- */
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">إدارة طلبات التأمين</h2>
              <button onClick={fetchApplications} className="text-blue-600 hover:underline text-sm">تحديث البيانات 🔄</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-blue-900 border-b">
                    <th className="p-4">العميل</th>
                    <th className="p-4">بيانات المركبة/الهوية</th>
                    <th className="p-4">الحالة والتحكم</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 && <tr><td colSpan="3" className="p-10 text-center text-gray-400">لا توجد طلبات حالياً</td></tr>}
                  {apps.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-700">{app.fullName}</div>
                        <div className="text-xs text-gray-500 italic">ID: {app.idNumber}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        لوحة السيارة: <span className="font-mono font-bold bg-gray-200 px-1 rounded">{app.carPlate}</span>
                      </td>
                      <td className="p-4">
                        {['step1', 'step2', 'step3'].map((stepKey) => (
                          <div key={stepKey} className="flex items-center justify-between bg-gray-50 p-2 mb-2 rounded border">
                            <span className="text-xs font-bold text-gray-500">{app.steps[stepKey].name}</span>
                            <div className="flex gap-2">
                              <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(app.steps[stepKey].status)}`}>
                                {translateStatus(app.steps[stepKey].status)}
                              </span>
                              <button onClick={() => handleUpdateStatus(app._id, stepKey, 'Approved')} className="text-green-600 hover:scale-110">✅</button>
                              <button onClick={() => handleUpdateStatus(app._id, stepKey, 'Rejected')} className="text-red-600 hover:scale-110">❌</button>
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* --- واجهة العميل --- */
          <div className="max-w-2xl mx-auto">
            {!myApplication ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-white text-center">
                  <h2 className="text-3xl font-bold mb-2">احصل على تأمينك الآن</h2>
                  <p className="text-blue-100 italic">خطوات بسيطة لتأمين مركبتك في ثوانٍ</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">الاسم الكامل (كما في الهوية)</label>
                    <input required className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition" 
                      placeholder="أدخل اسمك الثلاثي" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">رقم الهوية / الإقامة</label>
                      <input required className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition" 
                        placeholder="10XXXXXXXX" onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">رقم لوحة السيارة</label>
                      <input required className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition text-center font-bold" 
                        placeholder="1234 ABC" onChange={e => setFormData({...formData, carPlate: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
                    {loading ? "جاري الإرسال..." : "استمرار للخطوة التالية ⬅️"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-t-8 border-blue-600 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📄</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً {myApplication.fullName}</h2>
                <p className="text-gray-500 mb-8">حالة طلب التأمين الخاص بك:</p>
                
                <div className="space-y-4 text-right">
                  {Object.keys(myApplication.steps).map((key) => {
                    const step = myApplication.steps[key];
                    return (
                      <div key={key} className="p-4 rounded-xl border-2 border-gray-50 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-700">{step.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(step.status)}`}>
                            {translateStatus(step.status)}
                          </span>
                        </div>
                        {step.comment && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">⚠️ ملاحظة: {step.comment}</p>}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setMyApplication(null)} className="mt-8 text-blue-600 text-sm hover:underline italic underline decoration-dotted">تقديم طلب جديد</button>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="text-center p-10 text-gray-400 text-sm italic">
        جميع الحقوق محفوظة - منصة تأميني 2024
      </footer>
    </div>
  );
}

// وظائف مساعدة لتغيير الألوان والنصوص
const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-yellow-100 text-yellow-700';
  }
};

const translateStatus = (status) => {
  switch (status) {
    case 'Approved': return 'تم القبول';
    case 'Rejected': return 'مرفوض';
    default: return 'قيد المراجعة';
  }
};

export default App;
