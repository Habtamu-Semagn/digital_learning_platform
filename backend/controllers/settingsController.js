import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get current user's settings
export const getMySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -passwordResetToken -passwordResetExpires')
            .populate('institution', 'name');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

// Update profile settings
export const updateProfile = async (req, res) => {
    try {
        const { bio, title, socialLinks } = req.body;

        // Validation
        if (bio && bio.length > 500) {
            return res.status(400).json({
                status: 'fail',
                message: 'Bio cannot exceed 500 characters',
            });
        }

        if (title && title.length > 100) {
            return res.status(400).json({
                status: 'fail',
                message: 'Title cannot exceed 100 characters',
            });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'instructorProfile.bio': bio,
                    'instructorProfile.title': title,
                    'instructorProfile.socialLinks': socialLinks,
                },
            },
            { new: true, runValidators: true }
        ).select('instructorProfile');

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
    try {
        const allowedFrequencies = ['immediate', 'daily', 'weekly'];

        if (req.body.digestFrequency && !allowedFrequencies.includes(req.body.digestFrequency)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid digest frequency',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'preferences.notifications': req.body,
                },
            },
            { new: true, runValidators: true }
        ).select('preferences.notifications');

        res.status(200).json({
            status: 'success',
            data: { notifications: user.preferences.notifications },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Update privacy settings
export const updatePrivacySettings = async (req, res) => {
    try {
        const allowedVisibility = ['public', 'students', 'private'];

        if (req.body.profileVisibility && !allowedVisibility.includes(req.body.profileVisibility)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid profile visibility',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'preferences.privacy': req.body,
                },
            },
            { new: true, runValidators: true }
        ).select('preferences.privacy');

        res.status(200).json({
            status: 'success',
            data: { privacy: user.preferences.privacy },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Update course defaults
export const updateCourseDefaults = async (req, res) => {
    try {
        const { defaultPoints, defaultDueDateOffset, autoPublishAnnouncements } = req.body;

        // Validation
        if (defaultPoints !== undefined && (defaultPoints < 0 || defaultPoints > 1000)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Default points must be between 0 and 1000',
            });
        }

        if (defaultDueDateOffset !== undefined && (defaultDueDateOffset < 1 || defaultDueDateOffset > 365)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Default due date offset must be between 1 and 365 days',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'preferences.courseDefaults': req.body,
                },
            },
            { new: true, runValidators: true }
        ).select('preferences.courseDefaults');

        res.status(200).json({
            status: 'success',
            data: { courseDefaults: user.preferences.courseDefaults },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, newPasswordConfirm } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide all required fields',
            });
        }

        // Check if passwords match
        if (newPassword !== newPasswordConfirm) {
            return res.status(400).json({
                status: 'fail',
                message: 'New passwords do not match',
            });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Password must be 8-15 characters and include uppercase, lowercase, number, and special character',
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'fail',
                message: 'Current password is incorrect',
            });
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 12);
        user.passwordChangedAt = new Date();
        user.passwordConfirm = newPassword; // Required for validation
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
