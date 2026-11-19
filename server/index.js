import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1); // Render terminates HTTPS before forwarding requests.
const PORT = process.env.PORT || 4000;
const adminUsername = process.env.ADMIN_USERNAME?.trim();
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;
if (!adminUsername || adminUsername.length < 3 || !adminPassword || adminPassword.length < 10) {
 throw new Error('Set ADMIN_USERNAME (at least 3 characters) and ADMIN_PASSWORD (at least 10 characters) environment variables.');
}
if (!sessionSecret) throw new Error('Set the SESSION_SECRET environment variable.');
const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
const dataDir = path.join(__dirname, 'data'); const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(dataDir, { recursive: true }); fs.mkdirSync(uploadDir, { recursive: true });
const paths = { settings: path.join(dataDir,'settings.json'), projects: path.join(dataDir,'projects.json'), messages: path.join(dataDir,'messages.json') };
const defaults = {
 settings:{name:'Drex',title:'Full-Stack Developer',email:'programmingwithsamuel@gmail.com',github:'https://github.com/programmingwithsamuel',linkedin:'',location:'Nigeria',educationCourse:'Computer Science',educationSchool:'Nnamdi Azikiwe University · Nigeria',educationYears:'2025 — PRESENT',educationNote:'Learning the foundations of computing while building practical projects.',availability:'Available for opportunities',tagline:'I build digital experiences that solve real problems.',about:"I'm Drex, a Full-Stack Developer who enjoys turning ideas into useful, thoughtful digital products. I work across the frontend and backend, and I'm always learning, building and improving.",heroWords:['Full-Stack Developer','Problem Solver','Lifelong Learner'],cvUrl:'',profileImage:'',skills:['HTML','CSS','JavaScript','Python','React','Node.js','TypeScript','Git & GitHub','Flask','SQL'],services:['Responsive website development','Frontend development','Backend APIs','Website maintenance']},
 projects:[
  {id:uuid(),name:'Dabby Hair Sensation',category:'E-commerce',description:'A product-focused online storefront with an admin area for managing products.',tech:['HTML','CSS','JavaScript'],liveUrl:'https://dabby-hair.vercel.app',githubUrl:'',image:'',featured:true},
  {id:uuid(),name:'EduCore',category:'Education',description:'A school class-management project built to organise classroom information and workflows.',tech:['Python','Flask','JavaScript'],liveUrl:'',githubUrl:'',image:'',featured:true},
  {id:uuid(),name:'More projects coming soon',category:'In progress',description:'I am always experimenting, learning and building. More work will appear here.',tech:['Learning','Building'],liveUrl:'',githubUrl:'',image:'',featured:false}
 ]
};
function read(key){try{return JSON.parse(fs.readFileSync(paths[key],'utf8'))}catch{const v=defaults[key]??[];write(key,v);return v}}
function write(key,value){fs.writeFileSync(paths[key],JSON.stringify(value,null,2))}
for(const key of Object.keys(paths))if(!fs.existsSync(paths[key]))write(key,defaults[key]??[]);
app.use(cors({origin:true,credentials:true})); app.use(express.json({limit:'2mb'})); app.use('/uploads',express.static(uploadDir));
app.use(session({secret:sessionSecret,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:28800000}}));
const storage=multer.diskStorage({destination:(_r,_f,cb)=>cb(null,uploadDir),filename:(_r,file,cb)=>cb(null,`${Date.now()}-${uuid()}${path.extname(file.originalname).toLowerCase()}`)});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(_r,file,cb)=>{const ok=/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(path.extname(file.originalname));cb(ok?null:new Error('Only JPG, PNG, WEBP, GIF and PDF files are allowed.'),ok)}});
const requireAdmin=(req,res,next)=>req.session.admin?next():res.status(401).json({error:'Please sign in as the administrator.'});
app.get('/api/public',(_req,res)=>res.json({settings:read('settings'),projects:read('projects')}));
app.post('/api/login',async(req,res)=>{const username=typeof req.body?.username==='string'?req.body.username.trim():'';const password=typeof req.body?.password==='string'?req.body.password:'';const passwordValid=await bcrypt.compare(password,adminPasswordHash);if(username!==adminUsername||!passwordValid)return res.status(401).json({error:'Incorrect username or password.'});req.session.admin=true;res.json({success:true})});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({success:true})));
app.get('/api/admin/me',requireAdmin,(_req,res)=>res.json({authenticated:true}));
app.put('/api/admin/settings',requireAdmin,(req,res)=>{const allowed=['name','title','email','github','linkedin','location','educationCourse','educationSchool','educationYears','educationNote','availability','tagline','about','heroWords','cvUrl','profileImage','skills','services'];const current=read('settings');for(const k of allowed)if(req.body[k]!==undefined)current[k]=req.body[k];write('settings',current);res.json(current)});
app.post('/api/admin/upload',requireAdmin,upload.single('file'),(req,res)=>{if(!req.file)return res.status(400).json({error:'Choose a file to upload.'});res.json({url:`/uploads/${req.file.filename}`,originalName:req.file.originalname})});
app.post('/api/admin/projects',requireAdmin,(req,res)=>{const projects=read('projects');const p={...req.body,id:uuid()};projects.unshift(p);write('projects',projects);res.status(201).json(p)});
app.put('/api/admin/projects/:id',requireAdmin,(req,res)=>{const projects=read('projects');const i=projects.findIndex(p=>p.id===req.params.id);if(i<0)return res.status(404).json({error:'Project not found.'});projects[i]={...projects[i],...req.body,id:req.params.id};write('projects',projects);res.json(projects[i])});
app.delete('/api/admin/projects/:id',requireAdmin,(req,res)=>{const p=read('projects');const next=p.filter(x=>x.id!==req.params.id);if(next.length===p.length)return res.status(404).json({error:'Project not found.'});write('projects',next);res.json({success:true})});
app.post('/api/contact',(req,res)=>{const{name,email,subject,message}=req.body;if(![name,email,message].every(v=>typeof v==='string'&&v.trim())||message.length>5000)return res.status(400).json({error:'Please complete the required fields.'});const messages=read('messages');messages.unshift({id:uuid(),name:name.trim(),email:email.trim(),subject:(subject||'').trim(),message:message.trim(),createdAt:new Date().toISOString(),read:false});write('messages',messages);res.status(201).json({success:true})});
app.get('/api/admin/messages',requireAdmin,(_req,res)=>res.json(read('messages')));
app.patch('/api/admin/messages/:id',requireAdmin,(req,res)=>{const m=read('messages');const item=m.find(x=>x.id===req.params.id);if(!item)return res.status(404).json({error:'Message not found.'});item.read=!!req.body.read;write('messages',m);res.json(item)});
app.delete('/api/admin/messages/:id',requireAdmin,(req,res)=>{write('messages',read('messages').filter(x=>x.id!==req.params.id));res.json({success:true})});
app.use('/api',(_req,res)=>res.status(404).json({error:'Not found.'}));
app.use((err,_req,res,_next)=>res.status(400).json({error:err.message||'Something went wrong.'}));
const dist=path.join(__dirname,'../dist');if(fs.existsSync(dist)){app.use(express.static(dist));app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')))}
app.listen(PORT,()=>console.log(`Drex Portfolio server running at http://localhost:${PORT}`));
