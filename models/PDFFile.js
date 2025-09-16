// server/models/PDFFile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const PDFFile = sequelize.define('PDFFile', {
  uuid: { type: DataTypes.STRING, allowNull: false, unique: true },
  originalName: { type: DataTypes.STRING, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false }, // stored filename on disk
  path: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

User.hasMany(PDFFile, { foreignKey: 'userId', onDelete: 'CASCADE' });
PDFFile.belongsTo(User, { foreignKey: 'userId' });

module.exports = PDFFile;
