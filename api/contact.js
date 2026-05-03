const { sendContactEmails, validateSubmission } = require('../server/contact-email');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, error: 'Method not allowed.' });
    }

    const validation = validateSubmission(req.body || {});
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