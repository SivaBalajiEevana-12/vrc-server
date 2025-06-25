const express=require('express');
const app=express();
const db=require('./config/db');
require('dotenv').config();
const Volunteer=require('./models/volunter')
const cors=require('cors')
const gupshup=require('@api/gupshup')
const Manager=require('./models/manager');
const Service=require('./models/services')
const Event=require('./models/meetup')
const moment = require('moment');
const moment1 = require("moment-timezone");
const cron = require('node-cron');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const VolunteerAttendance = require('./models/attendence')
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const ManualAttendance=require('./models/manual')
// const fs = require('fs');
// const path = require('path');
const cloudinary = require('cloudinary').v2;
// const file=require('./')
// const manager = require('./models/manager');
db();
app.use(cors());
app.use(express.json());
cloudinary.config({
  cloud_name: 'dvm9yapki',
  api_key: '435241843987915',
  api_secret: 'RC506MY4qn6DV5shRvYOmvBXIOc'
});

const sendReminder = async (event, type) => {
  console.log(`🔔 Sending ${type} reminder for: ${event.venue} at ${event.cronDate}`);
  const users= await Volunteer.find({});
  for (const user of users){
     const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
  ? numberOnly
  : `91${numberOnly.slice(-10)}`; // take the last 10 digits

  await gupshup.sendingTextTemplate(
    {
      template: {
        id: "2643a762-e3b0-45fc-9005-fc687ee18480",
        params: [
          user.name,
          event.dateDisplay,
          event.timeDisplay,
          event.venue,
          event.locationLink,
        ],
      },
      "src.name": "Production",
      destination: fullNumber,
      source: "917075176108",
    },
    {
      apikey: "zbut4tsg1ouor2jks4umy1d92salxm38",
    }
  );
}
}

cron.schedule("*/15 * * * *", async () => {
  console.log("🔄 Running cron job to check for upcoming events...");
  try {
    const now = moment();
    const oneDayAhead = now.clone().add(1, "day");
    const oneHourAhead = now.clone().add(1, "hour");

    const events = await Event.find({
      cronDate: { $gte: now.toDate(), $lte: moment().add(2, "days").toDate() },
    });

    for (const event of events) {
      const eventTime = moment(event.cronDate);
      const diffToDay = Math.abs(eventTime.diff(oneDayAhead, "minutes"));
      const diffToHour = Math.abs(eventTime.diff(oneHourAhead, "minutes"));

      if (diffToDay <= 15 && !event.sentOneDayReminder) {
        await sendReminder(event, "⏰ 1-day");
        event.sentOneDayReminder = true;
        await event.save();
      } else if (diffToHour <= 15 && !event.sentOneHourReminder) {
        await sendReminder(event, "⏰ 1-hour");
        event.sentOneHourReminder = true;
        await event.save();
      }
    }
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
const FIXED_EVENT_TIME = moment.tz("2025-06-27 08:00", "Asia/Kolkata");

const sendReminder1 = async (type) => {
  console.log(`🔔 Sending ${type} reminder for event at ${FIXED_EVENT_TIME.format("DD/MM/YYYY hh:mm A")}`);
  
         const volunteers=await Volunteer.find({});
           for (const user of volunteers) {

    const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
  ? numberOnly
  : `91${numberOnly.slice(-10)}`; // take the last 10 digits

          // const reporting = await Manager.findOne({ name: user.serviceType });
          const manager = await Manager.findOne({ serviceType: user.serviceType });
     const message= await gupshup.sendingTextTemplate(
        {
          template: {
            id: '04ad934d-66d0-4558-8c12-d740345e4c40',
            params: [
              user.name,
             "This is a gentle reminder: your seva begins in about 24 hour.",
               "jaganath",
             user.serviceType,
           
              " Jagannath Swami Ki "
            //   location // fallback if message is empty
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
      console.log(fullNumber,message)
      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    }
    // return res.json({message:"message sent successfully"})
};

let oneDayReminderSent = false;
let oneHourReminderSent = true;

cron.schedule("*/5 * * * *", async () => {
  const now = moment.tz("Asia/Kolkata");
  const diffMinutes = FIXED_EVENT_TIME.diff(now, "minutes");

  console.log(`🕒 Now: ${now.format("DD/MM/YYYY hh:mm A")}, Event in ${diffMinutes} mins`);

  try {
    if (diffMinutes <= 1440 && diffMinutes > 1430 && !oneDayReminderSent) {
      await sendReminder1("⏰ 1-day");
      oneDayReminderSent = true;
    }

    if (diffMinutes <= 60 && diffMinutes > 50 && !oneHourReminderSent) {
      await sendReminder1("⏰ 1-hour");
      oneHourReminderSent = true;
    }
  } catch (err) {
    console.error("❌ Cron error:", err.message);
  }
});

app.post('/user', async (req, res) => {
  try {
    const { age, ...rest } = req.body;

    // Convert age to a number, or set to undefined if invalid
    const numericAge = !isNaN(Number(age)) ? Number(age) : undefined;

    const newVolunteer = new Volunteer({
      ...rest,
      age: numericAge,
    });

    await newVolunteer.save();

    const fullNumber = newVolunteer.whatsappNumber.startsWith('91')
      ? newVolunteer.whatsappNumber
      : `91${newVolunteer.whatsappNumber}`;

    const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '868b6c27-b39a-4689-9def-261a5527d3dc',
          params: [newVolunteer.name],
        },
        'src.name': 'Production',
        destination: fullNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
    const message1= await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
            params: [
              newVolunteer.name,
             "WhatsApp group",
               "https://chat.whatsapp.com/IMEzoJR7JUoIYItO4NZRju ",
            //   location // fallback if message is empty
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
    console.log(message.data);
    console.log(message1.data);
    console.log(newVolunteer)
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error saving volunteer:", error);
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
});
app.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);

    if (!deletedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/',async(req,res)=>{
    const users=await    Volunteer.find({});
    return res.json(users)
})
app.listen('3300',()=>{
    console.log("siva");
})
// PATCH /:id
app.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { serviceType } = req.body

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { serviceType },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message })
  }
})
app.post('/meetup', async (req, res) => {
  const { name, location, date, time, message } = req.body;

  try {
    const volunteers = await Volunteer.find();

    // Convert form date & time to IST
    const eventDateTime = new Date(`${date}T${time}`);

    const formattedDate = eventDateTime.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    const formattedTime = eventDateTime.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    for (const user of volunteers) {
      const fullNumber = user.whatsappNumber.startsWith('91')
        ? user.whatsappNumber
        : `91${user.whatsappNumber}`;

      await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'c644a009-5be0-438a-bfff-54d4576f394d',
            params: [
              user.name,
              name,
              `Training at ${location}`,
              formattedDate,
              formattedTime,
              message || '-',
              user.serviceAvailability,
              location // fallback if message is empty
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );

      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    }

    res.status(200).json({ success: true, message: 'Meetup messages sent to all volunteers' });
  } catch (error) {
    console.error('Error sending messages:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/send-notification',async (req,res)=>{
    try{
        const volunteers=await Volunteer.find({});
           for (const user of volunteers) {

    const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
  ? numberOnly
  : `91${numberOnly.slice(-10)}`; // take the last 10 digits

          // const reporting = await Manager.findOne({ name: user.serviceType });
          const manager = await Manager.findOne({ serviceType: user.serviceType });
     const message= await gupshup.sendingTextTemplate(
        {
          template: {
            id: '2c4669f3-ffe1-4865-92f1-603c4fdea020',
            params: [
              user.name,
             "Thank you for stepping forward to serve in the upcoming Jaganath Ratha Yatra! Your service is not just an offering of time — it is a sacred offering to Lord Jagannath that purifies the heart and brings immense spiritual benefit. ",
             user.serviceType,
             manager.username,
         
              manager.phone,
              " Jagannath Swami Ki "
            //   location // fallback if message is empty
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
      console.log(fullNumber,message)
      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    }
    return res.json({message:"message sent successfully"})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"Failed to send notification",error:err.message})
    }
})
app.post("/register-volunteer", async (req, res) => {
    try{
  // const { username, phone, serviceType } = req.body
  const { username, phone, serviceType, link, location, reportingTime } = req.body;


  // Validate input
  if (!username || !phone || !serviceType || !link || !location || !reportingTime) {
    return res.status(400).json({ message: "All fields are required." })
  }
    const manager = new Manager({
  username,
  phone,
  serviceType,
  link,
  location,
  reportingTime
});

await manager.save();
// const service = await new Service({
//   name: serviceType,
//   reportingTime: reportingTime});
//   await service.save();

    //        const volunteers=await Volunteer.find({serviceType});
    //        for (const user of volunteers) {

    //   const fullNumber = user.whatsappNumber.startsWith('91')
    //     ? user.whatsappNumber
    //     : `91${user.whatsappNumber}`;

    //   await gupshup.sendingTextTemplate(
    //     {
    //       template: {
    //         id: 'c4147032-8da7-4bb5-a4be-88f145a109e0',
    //         params: [
    //           user.name,
             
    //          user.serviceType,
    //           username,
    //          phone,
         
    //           "Thank You",
    //         //   location // fallback if message is empty
    //         ],
    //       },
    //       'src.name': 'Production',
    //       destination: fullNumber,
    //       source: '917075176108',
    //     },
    //     {
    //       apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
    //     }
    //   );

    //   await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    // }
    
  // Here, you could save to a database. For now, we log it.
  console.log("New Volunteer:", { username, phone, serviceType })

  res.status(201).json({ message: "Volunteer registered successfully." })
}
catch(err){
    console.log("Error",err);
    return res.status(500).json({message:"Error is Registering the Manager",error:err.message})
}
})
// app.delete("/delete-manager/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedManager = await Manager.findByIdAndDelete(id);

//     if (!deletedManager) {
//       return res.status(404).json({ message: "Manager not found." });
//     }

//     res.status(200).json({ message: "Manager deleted successfully.", data: deletedManager });
//   } catch (err) {
//     console.error("Delete Error:", err);
//     res.status(500).json({ message: "Error deleting manager.", error: err.message });
//   }
// });

app.get('/manager',async(req,res)=>{
    try{
        const manager=await Manager.find({});
        if(!manager){
            return res.status(400).json({message:"No Manager Found"});
        }
        return res.status(200).json(manager);
    }
    catch(err){
            console.log(err);
            return res.status(500).json({message:"Error in loading message",error:err.message})
    }
})
// app.delete('/delete',async (req,res)=>{
//     const users=await Volunteer.deleteMany();
//     const manager=await Manager.deleteMany();
//     return res.status(200).json({data:users,data2:manager})
// })
app.post("/service", async (req, res) => {
  try {
    const service = new Service({ name: req.body.name,reportingTime: req.body.reportingTime });
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all services (GET)
app.get("/service", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a service by ID (PUT)
app.put("/service/:id", async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a service by ID (DELETE)
app.delete("/service/:id", async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/events', async (req, res) => {
  try {
    const {
      date,          // expected: "2025-06-24"
      time,          // expected: "03:00 PM"
      venue = "Vizag",
      locationLink
    } = req.body;

    if (!date || !time || !locationLink) {
      return res.status(400).json({ error: "date, time, and locationLink are required." });
    }

    const cronDate = moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm A').toDate();

    const newEvent = new Event({
      dateDisplay: date,
      timeDisplay: time,
      cronDate,
      venue,
      locationLink
    });

    await newEvent.save();
    const Users= await Volunteer.find({});
    // let count =0;
    for(const user of Users){
      // const fullNumber = "91"+ user.whatsappNumber;
       const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
  ? numberOnly
  : `91${numberOnly.slice(-10)}`; // take the last 10 digits
  console.log("Full Number",fullNumber)

    const messages=await gupshup.sendingTextTemplate(
        {
          template: {
            id: '7939638e-af33-4df9-8a99-ad29790a08f0',
            params:[user.name
            ,"Jaganath Ratha Yatra!"
            ,date
            ,time
            ,venue
            ,locationLink
            ,"Jagannath"
           
            ,"Jagannath Swami Ki"],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
      // count++;
      // if(count===10){
      //   break;
      // }
      console.log("Message sent successfully",messages.data)
    }
    res.status(201).json({ message: "Event created successfully", event: newEvent });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating event." });
  }
});
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ cronDate: 1 }); // Sorted by date
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching events." });
  }
});

// Delete event by ID
app.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully.", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting event." });
  }
});

app.post('/group', async (req, res) => {
  try {
    const start = new Date("2025-06-24T18:00:00+05:30");
    const end = new Date("2025-06-25T09:50:00+05:30");

    const volunteers = await Volunteer.find({
      submittedAt: {
        $gte: start,
        $lte: end,
      }
    });

    for (const user of volunteers) {
      const numberOnly = user.whatsappNumber.replace(/\D/g, "");
      const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
        ? numberOnly
        : `91${numberOnly.slice(-10)}`;

      const manager = await Manager.findOne({ serviceType: user.serviceType });

      const message = await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
            params: [
              user.name,
              "WhatsApp group",
              "https://chat.whatsapp.com/IMEzoJR7JUoIYItO4NZRju",
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );

      console.log(fullNumber, message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limiting
    }

    res.json({ message: "message sent successfully" });
  } catch (err) {
    console.error("Error sending group message:", err);
    res.status(500).json({ message: "Failed to send group message", error: err.message });
  }
});

// app.get('/sivaname',async (req,res)=>{
//   try{
// const message= await gupshup.sendingTextTemplate(
//         {
//           template: {
//             id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
//             params: [
//               "siva",
//              "WhatsApp group",
//                "https://chat.whatsapp.com/IMEzoJR7JUoIYItO4NZRju ",
//             //   location // fallback if message is empty
//             ],
//           },
//           'src.name': 'Production',
//           destination: '917682059088',
//           source: '917075176108',
//         },
//         {
//           apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
//         }
//       );
//       return res.status(201).json({ message: `Registration successful ${message.data} `});
//   }
//   catch(err){
//     console.error("Error in sivaname:", err);
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }

// })
app.post('/send-template', async (req, res) => {
  try {
    const users = await Volunteer.find({ serviceType: "" });
    const results = [];

    for (const user of users) {
      const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits
      const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
        ? numberOnly
        : `91${numberOnly.slice(-10)}`;

      const data = qs.stringify({
        channel: 'whatsapp',
        source: '917075176108',
        destination: fullNumber,
        'src.name': '4KoeJVChI420QyWVhAW1kE7L',
        template: JSON.stringify({
          id: 'eac20b13-b389-46ad-917e-74df82058ce9',//eac20b13-b389-46ad-917e-74df82058ce9
          params: []
        }),
        message: JSON.stringify({
          image: {
            link: 'https://fss.gupshup.io/0/public/0/0/gupshup/917075176108/3f74176d-f1b5-498a-8f66-f9e702ef8775/1750766779757_hello.jpg'
          },
          type: 'image'
        })
      });

      try {
        const response = await axios.post('https://api.gupshup.io/wa/api/v1/template/msg', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': 'zbut4tsg1ouor2jks4umy1d92salxm38',
            'Cache-Control': 'no-cache'
          }
        });
        console.log(`Message sent to ${fullNumber}:`, response.data);
        results.push({ number: fullNumber, status: 'success', response: response.data });
      } catch (err) {
        console.error(`Error sending to ${fullNumber}:`, err.response?.data || err.message);
        results.push({ number: fullNumber, status: 'error', error: err.response?.data || err.message });
      }
    }

    // Send final response after processing all users
    res.json({ success: true, results });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// app.post('/bulk-update-service', async (req, res) => {
//   const filePath = path.join(__dirname, 'allvolunteer.csv');

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: 'CSV file not found.' });
//   }

//   const updates = [];
//   const results = {
//     updated: [],
//     notFound: [],
//     failed: [],
//   };

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on('data', (row) => {
//       // Normalize all keys to lowercase for safer access
//       const normalizedRow = {};
//       for (const key in row) {
//         normalizedRow[key.trim().toLowerCase()] = row[key].trim();
//       }

//       const rawNumber = normalizedRow['whatsapp number'] || normalizedRow['phone number'];
//       const serviceType = normalizedRow['service'];

//       if (!rawNumber || !serviceType) return;

//       const numberOnly = rawNumber.replace(/\D/g, '');
//       const tenDigitNumber = numberOnly.slice(-10); // Assume last 10 digits are correct

//       updates.push({ whatsappNumber: tenDigitNumber, serviceType });
//     })
//     .on('end', async () => {
//       for (const { whatsappNumber, serviceType } of updates) {
//         try {
//           const updated = await Volunteer.findOneAndUpdate(
//             { whatsappNumber },
//             { serviceType },
//             { new: true }
//           );

//           if (updated) {
//             results.updated.push(whatsappNumber);
//           } else {
//             results.notFound.push(whatsappNumber);
//           }
//         } catch (error) {
//           results.failed.push({ whatsappNumber, error: error.message });
//         }
//       }

//       res.json({
//         message: 'Bulk serviceType update complete.',
//         totalProcessed: updates.length,
//         ...results,
//       });
//     })
//     .on('error', (err) => {
//       console.error('CSV Read Error:', err);
//       res.status(500).json({ error: 'Failed to process CSV.' });
//     });
// });
app.post("/attendence", async (req, res) => {
  const { volunteerId } = req.query;

  if (!volunteerId) {
    return res.status(400).json({ message: "volunteerId is required in query string" });
  }

  try {
    // Check if volunteer exists
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Create attendance with current time
    const attendance = await Attendance.create({
      volunteer: volunteerId,
      // date will default to Date.now()
      status: "Present",
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });

  } catch (error) {
    console.error("Attendance error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post('/generate-qr/:volunteerId', async (req, res) => {
  const { volunteerId } = req.params;

  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    const userId = uuidv4(); // Unique for QR scanning

    // QR content and local file path
    const qrContent = `https://vrc-server-production.up.railway.app/verify/${userId}`;
    const qrFolder = path.join(__dirname, '../qrcodes');
    const qrPath = path.join(qrFolder, `${userId}.png`);

    fs.mkdirSync(qrFolder, { recursive: true });

    await QRCode.toFile(qrPath, qrContent);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrPath, {
      folder: 'volunteer_qr',
      public_id: userId,
      resource_type: 'image',
    });

    fs.unlinkSync(qrPath); // Clean up local file

    // Save attendance entry
    const attendance = new VolunteerAttendance({
      volunteer: volunteer._id,
      userId,
      qrUrl: uploadResult.secure_url,
      verified: false,
    });

    await attendance.save();
    const data = qs.stringify({
  channel: 'whatsapp',
  source: '917075176108',
  destination: '919392952946',
  'src.name': '4KoeJVChI420QyWVhAW1kE7L',
  template: JSON.stringify({
    id: 'a5376cf3-bb0d-48ee-99fb-d0eba59e27b6',
    params: [volunteer.name]
  }),
  message: JSON.stringify({
    image: {
      link: uploadResult.secure_url // Use the uploaded QR code URL
    },
    type: 'image'
  })
});

const config = {
  method: 'post',
  url: 'https://api.gupshup.io/wa/api/v1/template/msg',
  headers: {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'apikey': 'zbut4tsg1ouor2jks4umy1d92salxm38'
  },
  data: data
};

axios(config)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });

    res.status(200).json({
      message: 'QR code generated successfully',
      qrUrl: uploadResult.secure_url,
      userId,
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/verify/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the attendance record by userId
    const attendance = await VolunteerAttendance.findOne({ userId: id });

    if (!attendance) {
      return res.status(404).json({ message: 'Invalid or expired QR code.' });
    }

    // Check if already verified
    if (attendance.verified) {
      return res.status(200).json({ message: 'Volunteer already verified.', verified: true });
    }

    // Mark as verified
    attendance.verified = true;
    attendance.status = 'Present'; // Optional: Set status to Present
    // attendance.verifiedAt = new Date(); // Optional: Track when verification occurred
    await attendance.save();

    res.status(200).json({
      message: 'Volunteer successfully verified.',
      volunteerId: attendance.volunteer,
      verified: true,
    });

  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await ManualAttendance.find().populate('volunteer');
    // const records = await Volunteer.find({ serviceType: "" })
      // .populate({
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/user/:whatsappNumber',async (req,res)=>{
  const { whatsappNumber } = req.params;

  try {
    const user = await Volunteer.findOne({ whatsappNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})
app.get('/attendence/:whatsappNumber', async (req, res) => {
  const { whatsappNumber } = req.params;

  try {
    // Exclude serviceType field using projection
    const user = await Volunteer.findOne({ whatsappNumber }, { serviceType: 0, serviceAvailability: 0  });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/manual-attendance', async (req, res) => {
  const { volunteerId, status } = req.body;

  if (!["Present", "Absent"].includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status." });
  }

  try {
    const attendance = new ManualAttendance({
      volunteer: volunteerId,
      status
    });

    await attendance.save();
    res.status(200).json({ message: "Attendance saved." });
  } catch (err) {
    console.error("Manual attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
