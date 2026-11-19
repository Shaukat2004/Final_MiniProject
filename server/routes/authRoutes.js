import express from 'express';
import { minimothService } from '../services/minimothService.js';
import { dbStore } from '../models/inMemoryStore.js';
import { createAccessToken, requireAuth, requireRole } from '../middleware/auth.js';
import { isMongoReady } from '../config/db.js';
import { UserModel } from '../models/Schemas.js';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { createId } from '../utils/ids.js';

const router = express.Router();
const passwordLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
const caretakerInviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(password, salt, 64).toString('hex')
});

const verifyPassword = (password, stored) => {
  if (!stored?.salt || !stored?.hash) return false;
  const derived = crypto.scryptSync(password, stored.salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(stored.hash, 'hex'));
};

const publicUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const findUser = async (query) => isMongoReady() ? UserModel.findOne(query).lean() : dbStore.users.find((user) => Object.entries(query).every(([key, value]) => user[key] === value));
const saveUser = async (user) => {
  if (isMongoReady()) return (await UserModel.create(user)).toObject();
  dbStore.users.push(user);
  return user;
};
const updateUser = async (id, updates) => {
  if (isMongoReady()) return UserModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
  const user = dbStore.users.find((candidate) => candidate.id === id);
  if (user) Object.assign(user, updates);
  return user;
};

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Name, email, phone number and a password of at least 8 characters are required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await findUser({ email: normalizedEmail })) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }
  const normalizedPhone = phone.trim();
  if (await findUser({ contact: normalizedPhone })) {
    return res.status(409).json({ success: false, error: 'An account with this phone number already exists.' });
  }
  const passwordHash = hashPassword(password);
  const user = {
    id: createId('PAT'),
    name: name.trim(), email: normalizedEmail, phone: normalizedPhone, contact: normalizedPhone, role: 'patient',
    location: 'Mumbai, Maharashtra', passwordHash
  };
  await saveUser(user);
  res.status(201).json({ success: true, message: 'Patient account created.', token: createAccessToken(user), user: publicUser(user) });
});

router.post('/login-password', passwordLoginLimiter, async (req, res) => {
  const { email, password, role = 'patient' } = req.body;
  if (!email?.trim() || !password) return res.status(400).json({ success: false, error: 'Email and password are required.' });
  const user = await findUser({ email: email.trim().toLowerCase(), role });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }
  res.json({ success: true, message: 'Login successful.', token: createAccessToken(user), user: publicUser(user) });
});

router.post('/caretakers/invite', caretakerInviteLimiter, async (req, res) => {
  const { inviteCode, name, email, password, phone, caretakerProfileId } = req.body;
  if (!process.env.CARETAKER_INVITE_CODE || inviteCode !== process.env.CARETAKER_INVITE_CODE) {
    return res.status(403).json({ success: false, error: 'Caretaker invitations require an administrator invitation code.' });
  }
  if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !/^CT-\d+$/.test(caretakerProfileId || '')) {
    return res.status(400).json({ success: false, error: 'Name, email, a password of at least 8 characters, and a valid caretaker profile ID are required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await findUser({ email: normalizedEmail })) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }
  if (await findUser({ caretakerProfileId })) {
    return res.status(409).json({ success: false, error: 'This caretaker profile already has an account.' });
  }
  const user = {
    id: createId('CTK'),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || '',
    contact: phone?.trim() || normalizedEmail,
    role: 'caretaker',
    caretakerProfileId,
    passwordHash: hashPassword(password)
  };
  await saveUser(user);
  res.status(201).json({
    success: true,
    message: 'Caretaker account invited.',
    caretaker: publicUser(user)
  });
});

router.post('/caretakers/link', caretakerInviteLimiter, async (req, res) => {
  const { inviteCode, email, caretakerProfileId } = req.body;
  if (!process.env.CARETAKER_INVITE_CODE || inviteCode !== process.env.CARETAKER_INVITE_CODE) {
    return res.status(403).json({ success: false, error: 'Caretaker profile linking requires an administrator invitation code.' });
  }
  if (!email?.trim() || !/^CT-\d+$/.test(caretakerProfileId || '')) {
    return res.status(400).json({ success: false, error: 'A caretaker email and valid profile ID are required.' });
  }
  const caretaker = await findUser({ email: email.trim().toLowerCase(), role: 'caretaker' });
  if (!caretaker) return res.status(404).json({ success: false, error: 'Caretaker account not found.' });
  const existingLink = await findUser({ caretakerProfileId });
  if (existingLink && existingLink.id !== caretaker.id) {
    return res.status(409).json({ success: false, error: 'This caretaker profile is already linked to another account.' });
  }
  const updatedCaretaker = await updateUser(caretaker.id, { caretakerProfileId });
  res.json({
    success: true,
    message: 'Caretaker profile linked successfully.',
    caretaker: publicUser(updatedCaretaker)
  });
});

router.post('/doctors', requireAuth, requireRole('doctor'), async (req, res) => {
  const { name, email, phone, hospital, designation, doctorCode } = req.body;
  if (!process.env.DOCTOR_INVITE_CODE || doctorCode !== process.env.DOCTOR_INVITE_CODE) {
    return res.status(403).json({ success: false, error: 'Doctor accounts require an administrator invitation.' });
  }
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ success: false, error: 'Doctor name and email are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await findUser({ email: normalizedEmail })) return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  const doctor = {
    id: createId('DOC'), name: name.trim(), email: normalizedEmail,
    phone: phone?.trim() || '', role: 'doctor', hospital: hospital || '', designation: designation || 'Oncology physician'
  };
  await saveUser(doctor);
  res.status(201).json({ success: true, doctor: publicUser(doctor) });
});

// Send OTP via Minimoth Gateway
router.post('/send-otp', sendOtpLimiter, async (req, res) => {
  const { contact, channel = 'sms' } = req.body;

  if (!contact) {
    return res.status(400).json({ success: false, error: 'Recipient contact is required.' });
  }

  try {
    const result = await minimothService.sendOtp(contact, channel);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP & Sign In / Register
router.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
  const { contact, otp, name, role = 'patient', age, hospital, doctorCode } = req.body;

  if (typeof contact !== 'string' || !contact.trim() || typeof otp !== 'string' || !otp.trim()) {
    return res.status(400).json({ success: false, error: 'Contact and OTP are required.' });
  }

  if (!['patient', 'doctor'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Unsupported account role.' });
  }
  const normalizedContact = contact.trim();
  let user = await findUser({ contact: normalizedContact });
  if (!user && normalizedContact.includes('@')) user = await findUser({ email: normalizedContact.toLowerCase() });

  if (!user && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ success: false, error: 'Name is required to create an account.' });
  }
  if (!user && role === 'doctor' && (!process.env.DOCTOR_INVITE_CODE || doctorCode !== process.env.DOCTOR_INVITE_CODE)) {
    return res.status(403).json({ success: false, error: 'Doctor accounts require an administrator invitation.' });
  }
  if (user && user.role !== role) {
    return res.status(403).json({ success: false, error: 'This contact is registered for a different account role.' });
  }

  const verification = minimothService.verifyOtp(contact, otp);
  if (!verification.valid) {
    return res.status(401).json({ success: false, error: verification.message });
  }

  if (!user) {
    const parsedAge = age === undefined ? undefined : Number(age);
    user = {
      id: createId(role === 'doctor' ? 'DOC' : 'PAT'),
      name: name.trim(),
      contact: normalizedContact,
      phone: normalizedContact.includes('@') ? '' : normalizedContact,
      ...(normalizedContact.includes('@') ? { email: normalizedContact.toLowerCase() } : {}),
      role: role,
      ...(Number.isFinite(parsedAge) ? { age: parsedAge } : {}),
      ...(role === 'doctor' && hospital ? { hospital } : {})
    };
    user = await saveUser(user);
  } else if (name) {
    user = await updateUser(user.id, { name });
  }

  res.json({
    success: true,
    message: 'Authentication successful',
    token: createAccessToken(user),
    user: publicUser(user)
  });
});

// Get Current User Profile
router.get('/profile/:id', requireAuth, async (req, res) => {
  if (req.auth.sub !== req.params.id && req.auth.role !== 'doctor') return res.status(403).json({ success: false, error: 'Not allowed.' });
  const user = await findUser({ id: req.params.id });
  if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
  res.json({ success: true, user: publicUser(user) });
});

export default router;
