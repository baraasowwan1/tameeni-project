const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// إعدادات CORS: تسمح لجميع المواقع بالوصول (العميل والأدمن)
app.use(cors());
app.use(express.json());

// التحقق من وجود رابط قاعدة البيانات
const mongoURI = process.env.MONGO_URI;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "MY_SECRET_PASSWORD_123"; // مفتاح الأمان للوحة التحكم

if (!mongoURI) {
  console.error("❌ خطأ: MONGO_URI غير موجود في إعدادات البيئة!");
}

// الاتصال بـ MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('❌ فشل الاتصال بالقاعدة:', err.message));

// نموذج الطلب (Application Schema)
const ApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: { type: String, required: true },
  carPlate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  steps: {
    step1: { name: { type: String, default: "الهوية الوطنية" }, status: { type: String, default: 'Pending' }, comment: { type: String, default: '' } },
    step2: { name: { type: String, default: "بيانات المركبة" }, status: { type: String, default: 'Pending' }, comment: { type: String, default: '' } },
    step3: { name: { type: String, default: "الدفع" }, status: { type: String, default: 'Pending' }, comment: { type: String, default: '' } }
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

// --- حماية مسارات الأدمن (Middleware) ---
// هذه الوظيفة تتأكد أن الطلب القادم للوحة التحكم يحتوي على مفتاح الأمان الصحيح
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-secret'];
  if (adminKey === ADMIN_SECRET) {
    next();
  } else {
    res.status(401).json({ error: "غير مصرح لك بالوصول (Unauthorized)" });
  }
};

// --- المسارات (Routes) ---

// 1. تقديم طلب جديد (للعميل - متاح للجميع)
app.post('/api/apply', async (req, res) => {
  try {
    const newApp = new Application(req.body);
    const savedApp = await newApp.save();
    res.status(201).json(savedApp);
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء تقديم الطلب" });
  }
});

// 2. جلب كافة الطلبات (للأدمن فقط - محمي)
app.get('/api/admin/applications', adminAuth, async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب البيانات" });
  }
});

// 3. تحديث حالة خطوة معينة (للأدمن فقط - محمي)
app.patch('/api/admin/applications/:id/step', adminAuth, async (req, res) => {
  const { step, status, comment } = req.body;
  try {
    const updatePath = `steps.${step}`;
    const updated = await Application.findByIdAndUpdate(
      req.params.id, 
      { $set: { [`${updatePath}.status`]: status, [`${updatePath}.comment`]: comment } }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "الطلب غير موجود" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "خطأ في تحديث الحالة" });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على المنفذ: ${PORT}`));
