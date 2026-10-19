const jwt = require('jsonwebtoken');

const generateTokens = (userId, role) => {
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_access_secret';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret';

    // Generate Access Token (expires in 7 days for seamless session persistence)
    const accessToken = jwt.sign(
        { id: userId, role },
        secret,
        { expiresIn: '7d' }
    );

    // Generate Refresh Token (expires in 30 days)
    const refreshToken = jwt.sign(
        { id: userId, role },
        refreshSecret,
        { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
};

module.exports = { generateTokens };
