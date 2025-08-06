// filepath: d:\gosafe\zma-gosafe\server\api\stringee\debug.js
export default function handler(req, res) {
  const STRINGEE_API_KEY_SID = process.env.STRINGEE_API_KEY_SID;
  const STRINGEE_API_KEY_SECRET = process.env.STRINGEE_API_KEY_SECRET;
  res.status(200).json({
    hasApiKey: !!STRINGEE_API_KEY_SID,
    hasApiSecret: !!STRINGEE_API_KEY_SECRET,
    apiKeyPrefix: STRINGEE_API_KEY_SID ? STRINGEE_API_KEY_SID.substring(0, 10) + '...' : 'Not set',
    timestamp: new Date().toISOString()
  });
}