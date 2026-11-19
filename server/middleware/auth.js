import crypto from 'crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 8;

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

export function createAccessToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    name: user.name,
    ...(user.caretakerProfileId ? { caretakerProfileId: user.caretakerProfileId } : {}),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const encoded = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return res.status(401).json({ success: false, error: 'Invalid access token.' });
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(encoded).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ success: false, error: 'Invalid access token.' });
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ success: false, error: 'Access token expired.' });
    }
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid access token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission for this resource.' });
    }
    next();
  };
}
