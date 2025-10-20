import express from 'express'
// import db from '../models/medical.js'
import path from 'path'
// import bcrypt from 'bcrypt'
import { __dirname } from '../utils/path.js'
// import jwt from 'jsonwebtoken'
// import cookies from 'cookie-parser'
// import dashboard from './dashboard.js'

const loginrouter=express.Router()

loginrouter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
// loginrouter.post('/',async(req,res)=>{
//     try{
//         const {email,password} = req.body
//         let [rows]=await db.query(`SELECT * FROM signup_db WHERE email=? `,[email])
//         if(rows.length===0){
//             res.status(500).json({message:'Some error occur'})
//         }
//         const medical = rows[0];       //it returns the first elemet given by query
//         const ispassword= await bcrypt.compare(password,medical.password)
//         if(!ispassword){
//             res.status(500).json({message:'Some error occur'})
//         }
//         const token=jwt.sign({email:medical.email,userid:medical.id,},'suyash',{ expiresIn: '1h' })
//         res.cookie("token",token);
//         res.redirect('/dashboard');
    

//     }
//      catch (err) {
//         console.log("Login error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// })
export default loginrouter