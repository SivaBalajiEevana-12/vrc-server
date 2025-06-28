const express = require('express');
const router = express.Router();
const ProjectVolunteer = require('../models/projectVolulnteer');
const ProjectManager = require('../models/projectManager');
const ProjectAttendance = require('../models/ProjectAttendence');
// const VolunteerAttendance = require('../models/attendence');
const Project = require('../models/project')
router.get('/projects',async (req,res)=>{
    try{
            const projects = await Project.find({});
            if(!projects || projects.length === 0){
                return res.status(404).json({error:'No projets available'})
            }
            return res.status(200).json(projects);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:'Error while fetching projects'})
    }
})
router.post('/project',async (req,res)=>{
    try{
        const {name,location,date} =req.body;
        if(!name || name.trim()=== '' || !date || !location || location.trim() === ''){
            return res.status(400).json({error:'Project name is required'})
        }
        const existing = await Project.findOne({name:name.trim()});
        if(existing){
            return res.status(400).json({error:'Project with this name already exists'})
        }
        const project = new Project({name:name.trim(),date:date,location:location.trim()});
        await project.save();
        return res.status(201).json(project);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:'Error while creating project'})
    }
})
router.get('/project/:id',async (req,res)=>{
    try{
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        return res.status(200).json(project);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:'Error while fetching project'})
    }
})
router.post('/volunteer/:id',async (req,res)=>{

 try {
    const projectId = req.params.id;
    const { age, ...rest } = req.body;

    // Convert age to a number, or set to undefined if invalid
    const numericAge = !isNaN(Number(age)) ? Number(age) : undefined;

    const newVolunteer = new ProjectVolunteer({
        project:projectId,
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
module.exports= router;