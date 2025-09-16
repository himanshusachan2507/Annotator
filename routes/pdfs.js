// server/routes/pdfs.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const PDFFile = require('../models/PDFFile');
const Highlight = require('../models/Highlight');

// ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.pdf';
    const filename = id + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const pdfUuid = path.parse(req.file.filename).name;
    const newPdf = await PDFFile.create({
      uuid: pdfUuid,
      userId: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path
    });
    res.json({ uuid: pdfUuid, originalName: req.file.originalname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// list user's pdfs
router.get('/', auth, async (req, res) => {
  try {
    const list = await PDFFile.findAll({ where: { userId: req.user.id }, attributes: ['id','uuid','originalName','filename','createdAt'] });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// serve file
router.get('/file/:uuid', auth, async (req, res) => {
  try {
    const pdf = await PDFFile.findOne({ where: { uuid: req.params.uuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'File not found' });
    const absPath = path.resolve(pdf.path);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File not found on disk' });
    res.sendFile(absPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete file (and its highlights)
router.delete('/:uuid', auth, async (req, res) => {
  try {
    const pdf = await PDFFile.findOne({ where: { uuid: req.params.uuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'File not found' });

    // delete highlights
    await Highlight.destroy({ where: { pdfId: pdf.id } });

    // delete file from disk
    if (fs.existsSync(pdf.path)) fs.unlinkSync(pdf.path);

    // delete db row
    await pdf.destroy();

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
