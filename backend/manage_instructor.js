import mongoose from 'mongoose';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '.env') });

const manageInstructor = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/digital_learning_platform";
        await mongoose.connect(dbUrl);
        console.log('Connected to DB');

        // 1. Ask what to do (hardcoded for now based on user request)
        const action = process.argv[2]; // 'create' or 'update'
        const email = process.argv[3];
        const password = process.argv[4];

        if (!action || !email || !password) {
            console.log('Usage: node manage_instructor.js <create|update> <email> <password>');
            process.exit(1);
        }

        if (action === 'create') {
            const newUser = await User.create({
                name: 'Test Instructor',
                email,
                password,
                passwordConfirm: password,
                role: 'instructor',
                isActive: true
            });
            console.log('Instructor created successfully:', newUser.email);
        } else if (action === 'update') {
            const user = await User.findOne({ email });
            if (!user) {
                console.log('User not found');
                process.exit(1);
            }
            user.password = password;
            user.passwordConfirm = password;
            await user.save();
            console.log('Password updated successfully for:', user.email);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

manageInstructor();
