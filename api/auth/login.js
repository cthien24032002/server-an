const JWTService = require('../../services/jwtService');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { zaloUserId, userInfo } = req.body;

    if (!zaloUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing zaloUserId' 
      });
    }

    // Xác định role (có thể mở rộng logic này)
    const ADMIN_ID = "3368637342326461234";
    const role = zaloUserId === ADMIN_ID ? "admin" : "user";

    // Tạo JWT payload
    const payload = {
      id: zaloUserId,
      role: role,
      name: userInfo?.name || 'Unknown User',
      avatar: userInfo?.avatar || '',
      loginTime: Date.now()
    };

    // Generate JWT token
    const token = JWTService.generateToken(payload);

    console.log('✅ JWT generated for user:', zaloUserId, 'role:', role);

    res.json({
      success: true,
      token: token,
      user: {
        id: zaloUserId,
        role: role,
        name: payload.name,
        avatar: payload.avatar
      }
    });

  } catch (error) {
    console.error('❌ JWT login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}