import express from 'express';
import db from '../models/sql_connection.js';
import path from 'path';
import bcrypt from 'bcrypt';
import { __dirname } from '../utils/path.js';

const doctorrouter= express.Router();
function authenticateSession(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/login');
}
// Serve signup page
doctorrouter.get('/',authenticateSession, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'doctor.html'));
});
doctorrouter.post('/',async(req,res)=>{
  try{

  }
  catch{
    
  }

});
export default doctorrouter;