const { sendContactEmails, validateSubmission } = require('../../server/contact-email');

exports.handler = async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                Allow: 'POST'
            },
            body: JSON.stringify({ success: false, error: 'Method not allowed.' })
        };
    }

    let payload = {};

    try {
        payload = event.body ? JSON.parse(event.body) : {};
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: 'Invalid JSON payload.' })
        };
    }

    const validation = validateSubmission(payload);
    if (!validation.ok) {
        return {
            statusCode: validation.status,
            body: JSON.stringify({
                success: validation.status === 200,
                message: validation.message,
                error: validation.status === 200 ? undefined : validation.message
            })
        };
    }

    try {
        await sendContactEmails(validation.data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Thanks. Your enquiry has been sent and a confirmation email is on its way.'
            })
        };
    } catch (error) {
        console.error('Resend contact flow failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: 'We could not send your message right now. Please try again shortly.'
            })
        };
    }
};