
const mongoose = require('mongoose');
const faker = require('faker');
const Organization = require('../models/organizationModel');
const Roles = require('../models/roleModel');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGO_ADDRESS);

const db = mongoose.connection;

db.once('open', async () => {
  try {
    // Generate seed data
    const organizations = [];
    const roles = [];
    for (let i = 0; i < 10; i++) {
      const newId = new mongoose.Types.ObjectId()
      organizations.push({
        id: newId,
        _id: newId,
        name: faker.company.companyName(),
        // Other organization fields
      });
    }
    let RolesDetails = ['SuperAdmin', 'Admin', 'Marketing']
    for (let i = 0; i < 3; i++) {
      const newId = new mongoose.Types.ObjectId()
      roles.push({
        id: newId,
        _id: newId,
        name: RolesDetails[i],
        // Other organization fields
      });
    }

    // Insert seed data into the database
    await Organization.insertMany(organizations);
    await Roles.insertMany(roles);
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
});
