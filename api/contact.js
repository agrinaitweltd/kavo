const { sendContactEmails, validateSubmission } = require('../server/contact-email');

async function verifyRecaptcha(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        console.error('RECAPTCHA_SECRET_KEY environment variable is not set');
        return false;
    }
    const body = `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const data = await res.json();
    return data.success === true && (data.score === undefined || data.score >= 0.5);
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, error: 'Method not allowed.' });
    }

    const { recaptchaToken, ...rest } = req.body || {};

    if (!recaptchaToken) {
        return res.status(400).json({ success: false, error: 'reCAPTCHA verification required.' });
    }

    const captchaOk = await verifyRecaptcha(recaptchaToken).catch(() => false);
    if (!captchaOk) {
        return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed. Please try again.' });
    }

    const validation = validateSubmission(rest);
    if (!validation.ok) {
        return res.status(validation.status).json({ success: validation.status === 200, message: validation.message, error: validation.status === 200 ? undefined : validation.message });
    }

    try {
        await sendContactEmails(validation.data);
        return res.status(200).json({
            success: true,
            message: 'Thanks. Your enquiry has been sent and a confirmation email is on its way.'
        });
    } catch (error) {
        console.error('Resend contact flow failed:', error);
        return res.status(500).json({
            success: false,
            error: 'We could not send your message right now. Please try again shortly.'
        });
    }
};