const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
);

const sanitizeUser = (user) => ({
  id:     user._id,
  name:   user.name,
  email:  user.email,
  role:   user.role,
  avatar: user.avatar || null,
  phone:  user.phone  || null,
});

/* ---- REGISTER ---- */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim())     return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email?.trim())    return res.status(400).json({ success: false, message: 'Email is required' });
    if (!password)         return res.status(400).json({ success: false, message: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, phone: phone?.trim() });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

/* ---- LOGIN ---- */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    /* Same message for both "not found" and "wrong password" — prevents email enumeration */
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Please contact support.' });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

/* ---- GET ME ---- */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name price images slug')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

/* ---- UPDATE PROFILE ---- */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, whatsappNumber, address } = req.body;

    /* Prevent updating sensitive fields via this endpoint */
    const allowedUpdates = {};
    if (name)            allowedUpdates.name            = name.trim();
    if (phone)           allowedUpdates.phone           = phone.trim();
    if (whatsappNumber)  allowedUpdates.whatsappNumber  = whatsappNumber.trim();
    if (address)         allowedUpdates.address         = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdates,
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

/* ---- CHANGE PASSWORD ---- */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ success: false, message: 'New password is required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (currentPassword === newPassword) return res.status(400).json({ success: false, message: 'New password must be different from current password' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (currentPassword) {
      const isCorrect = await user.comparePassword(currentPassword);
      if (!isCorrect) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    /* Issue a fresh token after password change */
    const token = signToken(user._id);
    res.json({ success: true, message: 'Password updated successfully', token });
  } catch (err) { next(err); }
};

/* ---- FORGOT PASSWORD ---- */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    /* Always return success to prevent email enumeration */
    res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });

    /* Only actually send email if user exists */
    if (user) {
      const token = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      user.resetPasswordToken   = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save({ validateBeforeSave: false });
      /* TODO: Send email with reset link */
      console.log(`[Password Reset] Token for ${email}: ${token}`);
    }
  } catch (err) { next(err); }
};