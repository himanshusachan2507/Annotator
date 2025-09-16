// server/models/Highlight.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const PDFFile = require('./PDFFile');

const Highlight = sequelize.define('Highlight', {
  page: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: true },
  rects: { type: DataTypes.JSON, allowNull: false } // JSON array of rects
}, { timestamps: true });

PDFFile.hasMany(Highlight, { foreignKey: 'pdfId', onDelete: 'CASCADE' });
Highlight.belongsTo(PDFFile, { foreignKey: 'pdfId' });

module.exports = Highlight;
