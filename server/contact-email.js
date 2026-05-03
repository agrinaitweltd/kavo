try {
    require('dotenv').config();
} catch (error) {
    // Ignore missing dotenv in environments that inject variables directly.
}

const { Resend } = require('resend');

const DEFAULT_FROM_EMAIL = 'no-reply@kavotech.uk';
const DEFAULT_ADMIN_EMAIL = 'kavotechuk@gmail.com';
const DEFAULT_SITE_URL = 'https://kavotech.uk';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getConfig() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error('Missing RESEND_API_KEY environment variable.');
    }

    return {
        resend: new Resend(apiKey),
        fromEmail: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        adminEmail: process.env.CONTACT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
        siteUrl: process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL
    };
}

function validateSubmission(payload) {
    const name = (payload.name || '').trim();
    const email = (payload.email || '').trim();
    const phone = (payload.phone || '').trim();
    const companyName = (payload.companyName || '').trim();
    const service = (payload.service || '').trim();
    const serviceAnswers = Array.isArray(payload.serviceAnswers) ? payload.serviceAnswers : [];
    const budget = (payload.budget || '').trim();
    const timeline = (payload.timeline || '').trim();
    const referralSource = (payload.referralSource || '').trim();
    const message = (payload.message || '').trim();
    const consent = Boolean(payload.consent);
    const honeypot = (payload.honeypot || '').trim();
    const formStartedAt = Number(payload.formStartedAt || 0);
    const submittedAt = Date.now();

    if (honeypot) {
        return { ok: false, status: 200, message: 'Submission accepted.' };
    }

    if (!name || !email || !service || !budget || !timeline || !message) {
        return { ok: false, status: 400, message: 'Missing required fields.' };
    }

    if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, status: 400, message: 'Invalid email address.' };
    }

    if (!serviceAnswers.length) {
        return { ok: false, status: 400, message: 'Service questions are required.' };
    }

    if (message.length < 10) {
        return { ok: false, status: 400, message: 'Message must be at least 10 characters.' };
    }

    if (!consent) {
        return { ok: false, status: 400, message: 'Consent is required.' };
    }

    if (!Number.isFinite(formStartedAt) || submittedAt - formStartedAt < 1500) {
        return { ok: false, status: 429, message: 'Submission blocked. Please try again.' };
    }

    return {
        ok: true,
        data: {
            name,
            email,
            phone,
            companyName,
            service,
            serviceAnswers: serviceAnswers
                .map((entry) => ({
                    label: String(entry.label || '').trim(),
                    value: String(entry.value || '').trim()
                }))
                .filter((entry) => entry.label && entry.value),
            budget,
            timeline,
            referralSource,
            message
        }
    };
}

function formatServiceAnswers(answers) {
    return answers
        .map((entry) => `${entry.label}: ${entry.value}`)
        .join(' | ');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildEmailShell({ title, intro, detailRows, accentLabel, accentValue, ctaLabel, ctaHref, footerNote, siteUrl }) {
    const detailMarkup = detailRows.map((row) => `
        <tr>
            <td style="padding: 13px 0 12px; border-bottom: 1px solid #e9eaec;">
                <div style="font-size: 11px; line-height: 16px; color: #6b7078; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase;">${escapeHtml(row.label)}</div>
                <div style="margin-top: 5px; font-size: 15px; line-height: 24px; color: #111317;">${escapeHtml(row.value)}</div>
            </td>
        </tr>
    `).join('');

    const ctaMarkup = ctaLabel && ctaHref
        ? `
            <tr>
                <td style="padding: 18px 0 0; text-align: center;">
                    <a href="${escapeHtml(ctaHref)}" style="display: inline-block; padding: 13px 24px; border-radius: 999px; background: #111317; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; line-height: 13px; text-transform: uppercase; text-decoration: none;">${escapeHtml(ctaLabel)}</a>
                </td>
            </tr>
        `
        : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background: #f2f3f5; font-family: Arial, Helvetica, sans-serif; color: #111317;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f2f3f5; margin: 0; padding: 28px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 640px; background: #ffffff; border: 1px solid #d8dce0; border-radius: 22px; overflow: hidden; box-shadow: 0 16px 38px rgba(18, 22, 28, 0.08);">
                    <tr>
                        <td style="padding: 28px 32px 18px; text-align: center; border-bottom: 1px solid #eceff2;">
                            <img src="${escapeHtml(siteUrl)}/public/kavologo.png" alt="Kavo Tech" width="164" style="display: inline-block; max-width: 164px; width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 26px 32px 0;">
                            <div style="display: inline-block; padding: 7px 12px; border-radius: 999px; border: 1px solid #d4d8dd; color: #545b65; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">${escapeHtml(accentLabel)}</div>
                            <div style="margin-top: 12px; font-size: 30px; line-height: 36px; font-weight: 800; letter-spacing: -0.02em; color: #111317;">${escapeHtml(accentValue)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 26px 32px 6px;">
                            <div style="font-size: 40px; line-height: 44px; font-weight: 800; color: #111317; letter-spacing: -0.03em;">${escapeHtml(title)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 22px; font-size: 16px; line-height: 27px; color: #4b525b;">
                            ${escapeHtml(intro)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 14px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border: 1px solid #e0e4e8; border-radius: 16px; padding: 18px 20px;">
                                <tr>
                                    <td style="font-size: 12px; line-height: 18px; color: #5e6670; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0 0 4px;">Submission details</td>
                                </tr>
                                ${detailMarkup}
                            </table>
                        </td>
                    </tr>
                    ${ctaMarkup}
                    <tr>
                        <td style="padding: 24px 32px 8px; text-align: center; font-size: 13px; line-height: 22px; color: #69707a;">
                            ${escapeHtml(footerNote)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 30px; text-align: center; font-size: 12px; line-height: 20px; color: #8a919b;">
                            Kavo Tech, London, United Kingdom<br>
                            <a href="${escapeHtml(siteUrl)}" style="color: #111317; text-decoration: none; font-weight: 700;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

function buildUserEmail(data, siteUrl) {
    return buildEmailShell({
        title: 'We\'ve received your message',
        intro: `Thanks for reaching out, ${data.name}. We have received your enquiry and a member of the Kavo Tech team will review it shortly.`,
        detailRows: [
            { label: 'Name', value: data.name },
            { label: 'Email', value: data.email },
            { label: 'Phone', value: data.phone || 'Not provided' },
            { label: 'Company', value: data.companyName || 'Not provided' },
            { label: 'Service', value: data.service },
            { label: 'Service brief', value: formatServiceAnswers(data.serviceAnswers) || 'Not provided' },
            { label: 'Budget', value: data.budget },
            { label: 'Timeline', value: data.timeline },
            { label: 'Lead source', value: data.referralSource || 'Not provided' },
            { label: 'Message', value: data.message }
        ],
        accentLabel: 'Enquiry received',
        accentValue: 'We\'ve received your message',
        ctaLabel: 'Visit Kavo Tech',
        ctaHref: siteUrl,
        footerNote: 'This is a confirmation copy of the message you submitted to Kavo Tech.',
        siteUrl
    });
}

function buildAdminEmail(data, siteUrl) {
    return buildEmailShell({
        title: 'New lead received',
        intro: 'A new contact form submission has arrived from the Kavo Tech website. Review the lead details below and follow up promptly.',
        detailRows: [
            { label: 'Name', value: data.name },
            { label: 'Email', value: data.email },
            { label: 'Phone', value: data.phone || 'Not provided' },
            { label: 'Company', value: data.companyName || 'Not provided' },
            { label: 'Service', value: data.service },
            { label: 'Service brief', value: formatServiceAnswers(data.serviceAnswers) || 'Not provided' },
            { label: 'Budget', value: data.budget },
            { label: 'Timeline', value: data.timeline },
            { label: 'Lead source', value: data.referralSource || 'Not provided' },
            { label: 'Message', value: data.message }
        ],
        accentLabel: 'New lead',
        accentValue: data.name,
        ctaLabel: 'Reply to lead',
        ctaHref: `mailto:${data.email}`,
        footerNote: 'This message was generated by the Kavo Tech contact form.',
        siteUrl
    });
}

async function sendContactEmails(submission) {
    const { resend, fromEmail, adminEmail, siteUrl } = getConfig();

    const userEmail = buildUserEmail(submission, siteUrl);
    const adminEmailHtml = buildAdminEmail(submission, siteUrl);

    const [userResult, adminResult] = await Promise.all([
        resend.emails.send({
            from: `Kavo Tech <${fromEmail}>`,
            to: submission.email,
            subject: 'We’ve received your message',
            replyTo: adminEmail,
            html: userEmail,
            text: [
                `Hi ${submission.name},`,
                '',
                'Thanks for contacting Kavo Tech. We have received your message and will be in touch shortly.',
                '',
                `Name: ${submission.name}`,
                `Email: ${submission.email}`,
                `Phone: ${submission.phone || 'Not provided'}`,
                `Company: ${submission.companyName || 'Not provided'}`,
                `Service: ${submission.service}`,
                `Service brief: ${formatServiceAnswers(submission.serviceAnswers) || 'Not provided'}`,
                `Budget: ${submission.budget}`,
                `Timeline: ${submission.timeline}`,
                `Lead source: ${submission.referralSource || 'Not provided'}`,
                `Message: ${submission.message}`
            ].join('\n')
        }),
        resend.emails.send({
            from: `Kavo Tech <${fromEmail}>`,
            to: adminEmail,
            subject: 'New Contact Form Submission',
            replyTo: submission.email,
            html: adminEmailHtml,
            text: [
                'New lead from the Kavo Tech contact form.',
                '',
                `Name: ${submission.name}`,
                `Email: ${submission.email}`,
                `Phone: ${submission.phone || 'Not provided'}`,
                `Company: ${submission.companyName || 'Not provided'}`,
                `Service: ${submission.service}`,
                `Service brief: ${formatServiceAnswers(submission.serviceAnswers) || 'Not provided'}`,
                `Budget: ${submission.budget}`,
                `Timeline: ${submission.timeline}`,
                `Lead source: ${submission.referralSource || 'Not provided'}`,
                `Message: ${submission.message}`
            ].join('\n')
        })
    ]);

    return { userResult, adminResult };
}

module.exports = {
    sendContactEmails,
    validateSubmission
};