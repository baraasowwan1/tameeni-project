import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://your-backend-url.onrender.com/api"; // استبدله برابط Render لاحقاً

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({ fullName: '', idNumber: '', carPlate: '' });
  const [myApp, setMyApp] = useState(null);

  useEffect(() => { if (isAdmin) fetchApps(); }, [isAdmin]);

  const fetchApps = async () => {
    const res = await axios.get(`${API_BASE}/applications`);
    setApps(res.data);
  };

  const handleApply = async () => {
    const res = await axios.post(`${API_BASE}/apply`, form);
    setMyApp(res.data);
    alert("تم إرسال الطلب بنجاح");
  };

  const updateStatus = async (id, step, status) => {
    const comment = prompt("أدخل ملاحظة:");
    await axios.patch(`${API_BASE}/applications/${id}/step`, { step, status, comment });
    fetchApps();
  };

  return (
    <div className="p-5 font-sans" dir="rtl">
      <div className="flex justify-between items-center bg-blue-600 p-4 text-white rounded shadow-lg mb-6">
        <h1 className="text-xl font-bold">منصة تأميني</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} className="bg-white text-blue-600 px-4 py-1 rounded">
          {isAdmin ? "واجهة العميل" : "دخول الأدمن"}
        </button>
      </div>

      {isAdmin ? (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4">لوحة تحكم الأدمن (الطلبات)</h2>
          <table className="w-full border-collapse border text-right">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">العميل</th>
                <th className="border p-2">الهوية (Step 1)</th>
                <th className="border p-2">المركبة (Step 2)</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app._id}>
                  <td className="border p-2 font-bold">{app.fullName}</td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(app._id, 'step1', 'Approved')} className="bg-green-500 text-white px-2 rounded">قبول</button>
                      <button onClick={() => updateStatus(app._id, 'step1', 'Rejected')} className="bg-red-500 text-white px-2 rounded">رفض</button>
                    </div>
                    <div className="text-xs mt-1">الحالة: {app.steps.step1.status}</div>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(app._id, 'step2', 'Approved')} className="bg-green-500 text-white px-2 rounded">قبول</button>
                      <button onClick={() => updateStatus(app._id, 'step2', 'Rejected')} className="bg-red-500 text-white px-2 rounded">رفض</button>
                    </div>
                    <div className="text-xs mt-1">الحالة: {app.steps.step2.status}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          {!myApp ? (
            <>
              <h2 className="text-lg font-bold mb-4">تقديم طلب تأمين جديد</h2>
              <input className="w-full border p-2 mb-3" placeholder="الاسم الكامل" onChange={e => setForm({...form, fullName: e.target.value})} />
              <input className="w-full border p-2 mb-3" placeholder="رقم الهوية" onChange={e => setForm({...form, idNumber: e.target.value})} />
              <input className="w-full border p-2 mb-3" placeholder="لوحة السيارة" onChange={e => setForm({...form, carPlate: e.target.value})} />
              <button onClick={handleApply} className="w-full bg-blue-600 text-white py-2 rounded">إرسال</button>
            </>
          ) : (
            <div>
              <h2 className="font-bold mb-3">حالة طلبك يا {myApp.fullName}:</h2>
              <div className={`p-2 border mb-2 ${myApp.steps.step1.status === 'Approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                خطوة 1 (الهوية): {myApp.steps.step1.status}
                <p className="text-xs text-red-500">{myApp.steps.step1.comment}</p>
              </div>
              <div className={`p-2 border mb-2 ${myApp.steps.step2.status === 'Approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                خطوة 2 (المركبة): {myApp.steps.step2.status}
                <p className="text-xs text-red-500">{myApp.steps.step2.comment}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default App;
