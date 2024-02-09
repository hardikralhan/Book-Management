const nodemailer = require("nodemailer");
const MAIL_TYPE = require("../constants/emailType")
const Queue = require("bull");
const cron = require('node-cron');

// Set up Redis connection for Bull
const queue = new Queue('email', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
});

const sendMail = async (sender_mail, email_type, book_details) => {
  if (email_type == MAIL_TYPE.NEW_RELEASE_BOOK) { // for bulk email add in queue
    await queue.add('bulk_email', {
      sender_mail,
      email_type,
      book_details
    }).then(() => {
      console.log('Job added to the queue');
    }).catch(err => {
      console.error('Error adding job to the queue:', err);
    });
  } else { // for normal email add in queue
    await queue.add('single', {
      sender_mail,
      email_type,
      book_details
    }).then(() => {
      console.log('Job added to the queue');
    }).catch(err => {
      console.error('Error adding job to the queue:', err);
    });
  }
}

const run_queue = async () => {
  queue.process('single', async (job) => {
    const {
      sender_mail,
      email_type,
      book_details
    } = job.data;
    return await mail_transporter(sender_mail, email_type, book_details);
  });
}

// Set up cron job to process email tasks every minute
cron.schedule('* * * * *', async () => {
  // Get number of waiting and active email tasks
  const jobs = await queue.getJobs(['waiting', 'active']);
  const numEmailsInProgress = jobs.length;
  if (numEmailsInProgress != 0) {
    queue.process('bulk_email', 100, async (job) => {
      const {
        sender_mail,
        email_type,
        book_details
      } = job.data;
      return await mail_transporter(sender_mail, email_type, book_details);
    });
  }
  console.log(`${numEmailsInProgress} emails sent.`);
});



const mail_transporter = async (sender_mail, email_type, book_details) => {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hardikralhan66@gmail.com",
      pass: "sisgekuctzzwcyif"
    }
  });

  const mailOptions = {
    from: "hardikralhan66@gmail.com",
    to: sender_mail,
    subject: "New Book",

  };

  if (email_type == MAIL_TYPE.NEW_RELEASE_BOOK) {
    mailOptions.subject = "New Book Released"
    mailOptions.html = `${book_details.title} has been released`
  } else if (email_type == MAIL_TYPE.BOOK_SOLD) {
    mailOptions.subject = "Sale of book"
    mailOptions.html = `<b>${book_details.month}/${book_details.year}</b><br><br>Your book "${book_details.title}" has been sold at a price of ${book_details.price} with a quantity of ${book_details.quantity}<br> <br>Your total revenue is ${book_details.total_revenue} `
  }

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = {
  sendMail,
  run_queue
}