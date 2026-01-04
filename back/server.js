const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tameeni')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// نموذج الطلب
const ApplicationSchema = new mongoose.Schema({
  fullName: String,
  idNumber: String,
  carPlate: String,
  steps: {
    step1: { status: { type: String, default: 'Pending' }, comment: String },
    step2: { status: { type: String, default: 'Pending' }, comment: String },
    step3: { status: { type: String, default: 'Pending' }, comment: String }
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

// مسارات الـ API
app.post('/api/apply', async (req, res) => {
  try {
    const newApp = new Application(req.body);
    await newApp.save();
    res.status(201).json(newApp);
  } catch (err) { res.status(500).json(err); }
});

app.get('/api/applications', async (req, res) => {
  const apps = await Application.find();
  res.json(apps);
});

app.patch('/api/applications/:id/step', async (req, res) => {
  const { step, status, comment } = req.body;
  const update = { [`steps.${step}`]: { status, comment } };
  const updated = await Application.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  res.json(updated);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
