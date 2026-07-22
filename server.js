const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Allow frontend cross-origin requests
app.use(cors({ origin: '*' }));
app.use(express.json());

// Transporter using environment variable GMAIL_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'holamieazy@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});

app.get('/', (req, res) => {
    res.send('AeroGlobal Flight Backend API is Running');
});

app.post('/book', async (req, res) => {
    const { email, from, to, date } = req.body;
    const ticketCode = 'AG-' + Math.floor(100000 + Math.random() * 900000);

    console.log(`Received booking request: ${email} | ${from} -> ${to}`);

    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0a2540; padding: 20px; color: white; text-align: center;">
                <h2>✈️ AeroGlobal Airlines</h2>
                <p>Flight Booking Confirmation</p>
            </div>
            <div style="padding: 20px;">
                <p>Hello,</p>
                <p>Your flight booking has been successfully processed.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr><td style="padding: 8px; font-weight: bold;">Ticket Reference:</td><td style="padding: 8px; color: #635bff; font-weight: bold;">${ticketCode}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Departure:</td><td style="padding: 8px;">${from}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Destination:</td><td style="padding: 8px;">${to}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">${date}</td></tr>
                </table>
            </div>
        </div>
    `;

    try {
        // Send alert to admin (holamieazy@gmail.com)
        await transporter.sendMail({
            from: '"AeroGlobal Operations" <holamieazy@gmail.com>',
            to: 'holamieazy@gmail.com',
            subject: `🚨 New Flight Booking: ${ticketCode}`,
            html: htmlTemplate
        });

        // Send ticket copy to customer
        if (email) {
            await transporter.sendMail({
                from: '"AeroGlobal Airlines" <holamieazy@gmail.com>',
                to: email,
                subject: `Your Flight Ticket Details [${ticketCode}]`,
                html: htmlTemplate
            });
        }

        console.log("Emails sent successfully!");
        res.json({ success: true, code: ticketCode });
    } catch (err) {
        console.error("Nodemailer Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
