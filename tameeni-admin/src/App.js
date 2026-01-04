import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://tameeni-project.onrender.com/api";

function AdminApp() {
  const [apps, setApps] = useState([]);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // حماية بسيطة بكلمة مرور
  const handleLogin = () => {
    if (password === "123456") setIsLoggedIn(true); // غير كلمة المرور هنا
    else alert("كلمة المرور خطأ!");
  };

  const fetchApps = async () => {
    const res = await axios.get(`${API_BASE}/applications`);
    setApps(res.data);
  };

  useEffect(() => { if (isLoggedIn) fetchApps(); }, [isLoggedIn]);

  const updateStatus = async (id, step, status) => {
    const comment = prompt("أدخل ملاحظة للعميل:");
    await axios.patch(`${API_BASE}/applications/${id}/step`, { step, status, comment });
    fetchApps();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 text-center">
          <h2 className="text-2xl font-bold mb-6">دخول الإدارة 🛡️</h2>
          <input type="password" placeholder="كلمة المرور" className="w-full p-3 rounded bg-gray-700 mb-4 outline-none" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-blue-600 py-3 rounded font-bold hover:bg-blue-700">دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-right" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">لوحة تحكم الأدمن 🖥️</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-4 border">العميل</th>
              <th className="p-4 border">الهوية (Step 1)</th>
              <th className="p-4 border">المركبة (Step 2)</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="border-b">
                <td className="p-4 font-bold">{app.fullName}</td>
                <td className="p-4 border">
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(app._id, 'step1', 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">قبول</button>
                    <button onClick={() => updateStatus(app._id, 'step1', 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">رفض</button>
                  </div>
                  <div className="text-xs mt-1">الحالة: {app.steps.step1.status}</div>
                </td>
                <td className="p-4 border">
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(app._id, 'step2', 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">قبول</button>
                    <button onClick={() => updateStatus(app._id, 'step2', 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">رفض</button>
                  </div>
                  <div className="text-xs mt-1">الحالة: {app.steps.step2.status}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminApp;
