const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedDemoUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if demo user already exists
        const existingUser = await User.findOne({ email: 'demo@cryptovault.com' });
        if (!existingUser) {
            const demoUser = new User({
                username: 'demo',
                email: 'demo@cryptovault.com',
                password: 'demopassword123'
            });
            await demoUser.save();
            console.log('✅ Demo user created successfully');
        } else {
            console.log('ℹ️ Demo user already exists');
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDemoUser();