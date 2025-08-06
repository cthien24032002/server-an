const jwt = require('jsonwebtoken');

// Thêm endpoint này vào server
app.post('/auth/zalo-login', async (req, res) => {
  try {
    console.log('Received Zalo login request:', req.body);
    
    const { zaloUserId, name, avatar, phoneNumber } = req.body;
    
    if (!zaloUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zalo User ID is required' 
      });
    }
    
    // Tạo JWT token
    const jwtToken = jwt.sign(
      {
        userId: zaloUserId,
        name: name,
        avatar: avatar,
        phoneNumber: phoneNumber,
        platform: 'zalo',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Generated JWT token for user:', zaloUserId);
    
    res.json({
      success: true,
      jwtToken: jwtToken,
      user: { 
        userId: zaloUserId, 
        name, 
        avatar, 
        phoneNumber 
      }
    });
    
  } catch (error) {
    console.error('Zalo login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
});