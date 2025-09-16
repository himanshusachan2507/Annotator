// server/routes/highlights.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PDFFile = require('../models/PDFFile');
const Highlight = require('../models/Highlight');

// helper to map Sequelize object to include _id for frontend compatibility
function toClient(h) {
  const obj = h.get ? h.get({ plain: true }) : h;
  obj._id = obj.id; // frontend expects _id
  return obj;
}

// GET highlights for a PDF (by pdfUuid)
router.get('/:pdfUuid', auth, async (req, res) => {
  try {
    const pdf = await PDFFile.findOne({ where: { uuid: req.params.pdfUuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const items = await Highlight.findAll({ where: { pdfId: pdf.id } });
    res.json(items.map(toClient));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add highlight
router.post('/:pdfUuid', auth, async (req, res) => {
  try {
    const { page, text, rects } = req.body;
    if (typeof page !== 'number' || !rects) return res.status(400).json({ message: 'page and rects required' });

    const pdf = await PDFFile.findOne({ where: { uuid: req.params.pdfUuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const h = await Highlight.create({
      pdfId: pdf.id,
      page,
      text: text || '',
      rects
    });

    res.json(toClient(h));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update highlight
router.put('/:pdfUuid/:id', auth, async (req, res) => {
  try {
    const pdf = await PDFFile.findOne({ where: { uuid: req.params.pdfUuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const id = req.params.id;
    const existing = await Highlight.findOne({ where: { id, pdfId: pdf.id } });
    if (!existing) return res.status(404).json({ message: 'Highlight not found' });

    await existing.update(req.body);
    res.json(toClient(existing));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE highlight
router.delete('/:pdfUuid/:id', auth, async (req, res) => {
  try {
    const pdf = await PDFFile.findOne({ where: { uuid: req.params.pdfUuid, userId: req.user.id } });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const id = req.params.id;
    const del = await Highlight.destroy({ where: { id, pdfId: pdf.id } });
    if (!del) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
