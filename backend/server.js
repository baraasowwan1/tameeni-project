const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// إعدادات CORS للسماح لموقعك في Vercel بالوصول للبيانات
app.use(cors());
app.use(express.json());

// التحقق من وجود رابط قاعدة البيانات
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("خطأ: لم يتم العثور على متغير MONGO_URI في إعدادات البيئة (Environment Variables)!");
}

// الاتصال بـ MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح'))
  .catch(err => {
    console.error('❌ فشل الاتصال بقاعدة البيانات:');
    console.error(err.message);
  });

// نموذج الطلب (Application Schema)
const ApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: { type: String, required: true },
  carPlate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  steps: {
    step1: { 
      name: { type: String, default: "الهوية الوطنية" },
      status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
      comment: { type: String, default: '' }
    },
    step2: { 
      name: { type: String, default: "بيانات المركبة" },
      status: { type: String, default: 'Pending' },
      comment: { type: String, default: '' }
    },
    step3: { 
      name: { type: String, default: "الدفع" },
      status: { type: String, default: 'Pending' },
      comment: { type: String, default: '' }
    }
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

// --- المسارات (Routes) ---

// 1. تقديم طلب جديد (للعميل)
app.post('/api/apply', async (req, res) => {
  try {
    const newApp = new Application(req.body);
    const savedApp = await newApp.save();
    console.log("تم استلام طلب جديد من:", savedApp.fullName);
    res.status(201).json(savedApp);
  } catch (err) {
    console.error("خطأ في حفظ الطلب:", err.message);
    res.status(500).json({ error: "حدث خطأ أثناء تقديم الطلب" });
  }
});

// 2. جلب كافة الطلبات (للأدمن)
app.get('/api/applications', async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب البيانات" });
  }
});

// 3. تحديث حالة خطوة معينة (للأدمن)
app.patch('/api/applications/:id/step', async (req, res) => {
  const { step, status, comment } = req.body; // step: 'step1', 'step2', or 'step3'
  
  try {
    const updatePath = `steps.${step}`;
    const updated = await Application.findByIdAndUpdate(
      req.params.id, 
      { 
        $set: { 
          [`${updatePath}.status`]: status,
          [`${updatePath}.comment`]: comment 
        } 
      }, 
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ error: "الطلب غير موجود" });
    
    console.log(`تم تحديث ${step} للعميل ${updated.fullName} إلى ${status}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "خطأ في تحديث الحالة" });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل الآن على المنفذ: ${PORT}`);
});
