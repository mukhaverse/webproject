// require('dotenv').config();
// const nodemailer = require("nodemailer");
// const hbs = require('nodemailer-express-handlebars');

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// const hbsOptions = {
//   viewEngine: {
//     extname: '.hbs',
//     defaultLayout: false,
//   },
//   viewPath: 'views',
//   extName: '.hbs',
// };

// transporter.use('compile', hbs(hbsOptions)); 

// async function sendEmail({ to, subject, template, context, attachments }) {
//   const mailOptions = {
//     from: process.env.GMAIL_USER,
//     to,
//     subject,   
//     template,
//     context,
//     attachments,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully: ', info.response);
//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// }

// module.exports = { sendEmail };





require("dotenv").config();

const nodemailer = require("nodemailer");

const nodemailerExpressHandlebars =
  require("nodemailer-express-handlebars").default ||
  require("nodemailer-express-handlebars");

const { engine } = require("express-handlebars");


// ================= TRANSPORTER =================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


// ================= HANDLEBARS =================

const hbsOptions = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: "views",
    defaultLayout: false,
    partialsDir: "views",
    engine,
  },

  viewPath: "views",
  extName: ".hbs",
};


transporter.use(
  "compile",
  nodemailerExpressHandlebars(hbsOptions)
);


// ================= SEND EMAIL FUNCTION =================

async function sendEmail({
  to,
  subject,
  template,
  context,
  attachments,
}) {

  const mailOptions = {
    from: process.env.GMAIL_USER,

    to,
    subject,

    template,
    context,

    attachments,
  };

  try {

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.response);

    return info;

  } catch (error) {

    console.error("Error sending email:", error);

    throw error;
  }
}


// ================= EXPORT =================

module.exports = { sendEmail };