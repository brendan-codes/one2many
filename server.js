let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let path = require('path');
let Schema = mongoose.Schema;

let app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({extended: true}));

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
    // autoIndexing: true
};

mongoose.connect('mongodb://localhost:27017/messages', options);

mongoose.Promise = global.Promise;

let messageSchema = new Schema({
    name: String,
    text: String,
    _comments: [{type: mongoose.Types.ObjectId, ref: 'Comment'}]
});

let commentSchema = new Schema({
    name: String,
    text: String,
    _message: {type: mongoose.Types.ObjectId, ref: 'Message'}
});

let Message = new mongoose.model('Message', messageSchema);
let Comment = new mongoose.model('Comment', commentSchema);

app.get('/', (req, res)=>{
    Message.find().populate('_comments').exec()
        .catch((err) => {
            console.log(err);
            res.render('index');
        })
        .then((allMessages) => {
            console.log(allMessages);
            res.render('index', {messages: allMessages});
        })
})

app.post('/message', (req, res)=>{
    console.log(req.body);
    Message.create(req.body)
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        })
        .then((newMessage) => {
            console.log(newMessage);
            res.redirect('/');
        })
});

app.post('/comment/:id', (req, res)=>{
    console.log(req.body);
    console.log(req.params.id);
    let newComment = new Comment(req.body);
    newComment._message = req.params.id;

    newComment.save()
        .catch((err) => {
            console.log(err);
            res.redirect('/');
        })
        .then((savedComment) => {
            console.log(savedComment);

            Message.findOne({_id: req.params.id})
                .catch((err) => {
                    console.log(err);
                    res.redirect('/');
                })
                .then((message) => {
                  message._comments.push(savedComment);
                  message.save()
                        .catch((err) => {
                            console.log(err);
                            res.redirect('/');
                        })
                        .then((newMessage) => {
                            console.log(newMessage);
                            res.redirect('/');
                        })
                })
        })
});


app.listen(9002, ()=>{
    console.log('Hello at 9002');
})