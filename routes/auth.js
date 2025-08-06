const jwt = require('jsonwebtoken');

// Thêm route này nếu chưa có
app.post('/auth/zalo', async (req, res) => {
  try {
    const { id, name, avatar } = req.body;
    
    console.log('📱 Received Zalo authentication request for:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    // Tạm thời set tất cả user là "user", trừ ADMIN_ID
    const ADMIN_ID = "3368637342326461234";
    const role = id === ADMIN_ID ? "admin" : "user";
    
    // Tạo JWT token
    const jwtPayload = {
      id: id,
      name: name,
      avatar: avatar,
      role: role,
      platform: 'zalo',
      iat: Math.floor(Date.now() / 1000)
    };
    
    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { 
      expiresIn: '7d' 
    });
    
    console.log(`✅ Zalo user authenticated: ${id}, Role: ${role}`);
    
    res.json({
      success: true,
      jwtToken: jwtToken,
      user: {
        id: id,
        name: name,
        role: role
      }
    });
    
  } catch (error) {
    console.error('❌ Zalo authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
});