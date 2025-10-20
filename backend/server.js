import express from 'express';
import path from 'path';
import http from 'http'
import { __dirname, __filename } from './utils/path.js';
import loginrouter from './routes/loginRoute.js';
const app = express();
const server=http.createServer(app)


app.use(express.urlencoded({ extended: true }));
app.use(express.json());  
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.use('/login',loginrouter);

server.listen(process.env.PORT || 3000, () => {
    console.log('Server running at http://localhost:3000');
});
