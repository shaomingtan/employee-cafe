'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      this.belongsTo(models.Cafe)
    }
  }
  Employee.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(['male','female']),
      allowNull: false,
    },
    cafeId: DataTypes.STRING,
    startDateAtCafe: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};