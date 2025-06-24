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
// const manager = require('./models/manager');
db();
app.use(cors());
app.use(express.json());

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

    console.log(message.data);
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
const service = await new Service({
  name: serviceType,
  reportingTime: reportingTime});
  await service.save();

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



