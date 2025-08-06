const jwt = require('jsonwebtoken');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    const STRINGEE_API_KEY_SID = process.env.STRINGEE_API_KEY_SID;
    const STRINGEE_API_KEY_SECRET = process.env.STRINGEE_API_KEY_SECRET;

    if (!STRINGEE_API_KEY_SID || !STRINGEE_API_KEY_SECRET) {
      throw new Error('Missing Stringee credentials');
    }

    // Tạo JWT token với đúng payload
    const payload = {
      jti: `${STRINGEE_API_KEY_SID}-${Date.now()}`,
      iss: STRINGEE_API_KEY_SID,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      userId: userId,
      // Thêm permissions cho voice call
      permissions: {
        call: true,
        message: true
      }
    };

    const token = jwt.sign(payload, STRINGEE_API_KEY_SECRET, {
      algorithm: 'HS256'
    });

    console.log('✅ Stringee token generated for:', userId);
    
    res.json({
      success: true,
      token: token,
      userId: userId,
      expires: payload.exp
    });

  } catch (error) {
    console.error('❌ Stringee token error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
}
