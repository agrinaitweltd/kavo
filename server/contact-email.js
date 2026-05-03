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
    const website = (payload.website || '').trim();
    const budget = (payload.budget || '').trim();
    const timeline = (payload.timeline || '').trim();
    const preferredContact = (payload.preferredContact || '').trim();
    const referralSource = (payload.referralSource || '').trim();
    const message = (payload.message || '').trim();
    const consent = Boolean(payload.consent);
    const honeypot = (payload.honeypot || '').trim();
    const formStartedAt = Number(payload.formStartedAt || 0);
    const submittedAt = Date.now();

    if (honeypot) {
        return { ok: false, status: 200, message: 'Submission accepted.' };
    }

    if (!name || !email || !service || !budget || !timeline || !preferredContact || !message) {
        return { ok: false, status: 400, message: 'Missing required fields.' };
    }

    if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, status: 400, message: 'Invalid email address.' };
    }

    if (website && !/^https?:\/\//i.test(website)) {
        return { ok: false, status: 400, message: 'Invalid website URL.' };
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
            website,
            budget,
            timeline,
            preferredContact,
            referralSource,
            message
        }
    };
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
            <td style="padding: 0 0 8px; font-size: 12px; line-height: 18px; color: #8c8277; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">${escapeHtml(row.label)}</td>
        </tr>
        <tr>
            <td style="padding: 0 0 18px; font-size: 15px; line-height: 24px; color: #262321;">${escapeHtml(row.value)}</td>
        </tr>
    `).join('');

    const ctaMarkup = ctaLabel && ctaHref
        ? `
            <tr>
                <td style="padding: 8px 0 0;">
                    <a href="${escapeHtml(ctaHref)}" style="display: inline-block; padding: 14px 28px; border-radius: 999px; background: #ff7a1a; color: #ffffff; font-size: 15px; font-weight: 700; line-height: 15px; text-decoration: none;">${escapeHtml(ctaLabel)}</a>
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
<body style="margin: 0; padding: 0; background: #f4f0ea; font-family: Arial, Helvetica, sans-serif; color: #262321;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f4f0ea; margin: 0; padding: 24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 640px; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 18px 50px rgba(21, 17, 13, 0.08);">
                    <tr>
                        <td style="padding: 34px 32px 20px; text-align: center;">
                            <img src="${escapeHtml(siteUrl)}/public/kavologo.png" alt="Kavo Tech" width="164" style="display: inline-block; max-width: 164px; width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #ffd955 0%, #ffbc1a 56%, #fff1bf 100%); border-radius: 24px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 28px 28px 88px; position: relative;">
                                        <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.46); color: #6b4300; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">${escapeHtml(accentLabel)}</div>
                                        <div style="margin-top: 16px; font-size: 36px; line-height: 42px; font-weight: 800; color: #262321; max-width: 360px;">${escapeHtml(accentValue)}</div>
                                        <div style="position: relative; margin-top: 26px; height: 74px; border-top-left-radius: 220px; border-top-right-radius: 220px; background: rgba(255, 255, 255, 0.84);"></div>
                                        <div style="position: absolute; right: 28px; bottom: 24px; width: 88px; height: 88px; border-radius: 50%; background: #ff7a1a; box-shadow: 0 12px 18px rgba(255, 122, 26, 0.28);"></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 32px 8px; text-align: center;">
                            <div style="font-size: 48px; line-height: 52px; font-weight: 800; color: #262321; letter-spacing: -0.03em;">${escapeHtml(title)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 26px; text-align: center; font-size: 17px; line-height: 29px; color: #5f5852;">
                            ${escapeHtml(intro)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fbf8f4; border: 1px solid #efe7dc; border-radius: 20px; padding: 24px;">
                                <tr>
                                    <td style="font-size: 13px; line-height: 18px; color: #8c8277; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0 0 16px;">Submission details</td>
                                </tr>
                                ${detailMarkup}
                            </table>
                        </td>
                    </tr>
                    ${ctaMarkup}
                    <tr>
                        <td style="padding: 28px 32px 10px; text-align: center; font-size: 14px; line-height: 24px; color: #7b736b;">
                            ${escapeHtml(footerNote)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 32px; text-align: center; font-size: 13px; line-height: 22px; color: #a39a91;">
                            Kavo Tech, London, United Kingdom<br>
                            <a href="${escapeHtml(siteUrl)}" style="color: #ff7a1a; text-decoration: none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
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
            { label: 'Website', value: data.website || 'Not provided' },
            { label: 'Budget', value: data.budget },
            { label: 'Timeline', value: data.timeline },
            { label: 'Preferred contact', value: data.preferredContact },
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
            { label: 'Website', value: data.website || 'Not provided' },
            { label: 'Budget', value: data.budget },
            { label: 'Timeline', value: data.timeline },
            { label: 'Preferred contact', value: data.preferredContact },
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
                `Website: ${submission.website || 'Not provided'}`,
                `Budget: ${submission.budget}`,
                `Timeline: ${submission.timeline}`,
                `Preferred contact: ${submission.preferredContact}`,
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
                `Website: ${submission.website || 'Not provided'}`,
                `Budget: ${submission.budget}`,
                `Timeline: ${submission.timeline}`,
                `Preferred contact: ${submission.preferredContact}`,
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