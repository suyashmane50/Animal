import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ success: false, message: 'Failed to logout' });
            }

            // Match cookie options used during session creation
            res.clearCookie('connect.sid', {
                path: '/',       // important
                httpOnly: true,  // should match your session cookie
                secure: false    // set to true if you're using HTTPS
            });

            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    } else {
        return res.status(200).json({ success: true, message: 'No active session' });
    }
});

export default router;
