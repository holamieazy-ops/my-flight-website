const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Setup Gmail Helper
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'holamieazy@gmail.com',
        pass: process.env.GMAIL_PASS // We will set this secret in Render!
    }
});

// Test route to check if server works
app.get('/', (req, res) => {
    res.send('Flight Backend Brain is Working!');
});

// Flight Booking API
app.post('/book', async (req, res) => {
    const { email, from, to, date } = req.body;
    const ticketCode = 'AG-' + Math.floor(100000 + Math.random() * 900000);

    const emailContent = `
        <h2>✈️ New Flight Booking Confirmation!</h2>
        <p><strong>Customer:</strong> ${email}</p>
        <p><strong>Ticket Code:</strong> ${ticketCode}</p>
        <p><strong>Route:</strong> ${from} ➔ ${to}</p>
        <p><strong>Date:</strong> ${date}</p>
    `;

    try {
        // Send email to YOU (holamieazy@gmail.com)
        await transporter.sendMail({
            from: 'AeroGlobal System <holamieazy@gmail.com>',
            to: 'holamieazy@gmail.com',
            subject: `🚨 New Flight Booked: ${ticketCode}`,
            html: emailContent
        });

        // Send email to CUSTOMER
        if (email) {
            await transporter.sendMail({
                from: 'AeroGlobal Airlines <holamieazy@gmail.com>',
                to: email,
                subject: `Your Flight Ticket [${ticketCode}]`,
                html: emailContent
            });
        }

        res.json({ success: true, code: ticketCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
