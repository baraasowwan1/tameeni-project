import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "https://tameeni-project.onrender.com/api";

function App() {
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', carPlate: '' });
  const [myApplication, setMyApplication] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/apply`, formData);
      setMyApplication(res.data);
    } catch (err) { alert("حدث خطأ في الإرسال"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right p-6" dir="rtl">
       <header className="max-w-2xl mx-auto mb-10 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded text-white font-bold">T</div>
          <h1 className="text-2xl font-bold text-blue-900">منصة تأميني للعملاء</h1>
       </header>

       <main className="max-w-2xl mx-auto">
          {!myApplication ? (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-4">
              <h2 className="text-xl font-bold mb-4">تقديم طلب تأمين</h2>
              <input required className="w-full border p-3 rounded-lg" placeholder="الاسم الكامل" onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input required className="w-full border p-3 rounded-lg" placeholder="رقم الهوية" onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              <input required className="w-full border p-3 rounded-lg" placeholder="رقم اللوحة" onChange={e => setFormData({...formData, carPlate: e.target.value})} />
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">إرسال الطلب</button>
            </form>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600">
              <h2 className="text-xl font-bold mb-6 text-center text-green-600 font-bold">تم استلام طلبك بنجاح ✅</h2>
              {['step1', 'step2', 'step3'].map(key => (
                <div key={key} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between font-bold">
                    <span>{myApplication.steps[key].name}</span>
                    <span className={myApplication.steps[key].status === 'Approved' ? 'text-green-600' : 'text-orange-500'}>
                      {myApplication.steps[key].status === 'Approved' ? 'تم القبول' : 'قيد المراجعة'}
                    </span>
                  </div>
                  {myApplication.steps[key].comment && <p className="text-red-500 text-sm mt-2">ملاحظة: {myApplication.steps[key].comment}</p>}
                </div>
              ))}
            </div>
          )}
       </main>
    </div>
  );
}
export default App;
