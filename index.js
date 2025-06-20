const express=require('express');
const app=express();
const db=require('./config/db');
require('dotenv').config();
const Volunteer=require('./models/volunter')
const cors=require('cors')
const gupshup=require('@api/gupshup')
const Manager=require('./models/manager');
const Service=require('./models/services')
// const manager = require('./models/manager');
db();
app.use(cors());
app.use(express.json());
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

      const fullNumber = user.whatsappNumber.startsWith('91')
        ? user.whatsappNumber
        : `91${user.whatsappNumber}`;

     const message= await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'cb3b2ea1-32fb-4a8e-a9e3-f7902c77510b',
            params: [
              user.name,
             
              "Vizag",
              "June 27 2025 9:00 am",
             user.serviceType,
         
              user.serviceAvailability,
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
  const { username, phone, serviceType } = req.body

  // Validate input
  if (!username || !phone || !serviceType) {
    return res.status(400).json({ message: "All fields are required." })
  }
    const manager = await new Manager({
        username,
        phone,
        serviceType
    })
    await manager.save();
           const volunteers=await Volunteer.find({serviceType});
           for (const user of volunteers) {

      const fullNumber = user.whatsappNumber.startsWith('91')
        ? user.whatsappNumber
        : `91${user.whatsappNumber}`;

      await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'c4147032-8da7-4bb5-a4be-88f145a109e0',
            params: [
              user.name,
             
             user.serviceType,
              username,
             phone,
         
              "Thank You",
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

      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    }
    
  // Here, you could save to a database. For now, we log it.
  console.log("New Volunteer:", { username, phone, serviceType })

  res.status(201).json({ message: "Volunteer registered successfully." })
}
catch(err){
    console.log("Error",err);
    return res.status(500).json({message:"Error is Registering the Manager",error:err.message})
}
})
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
    const service = new Service({ name: req.body.name });
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

