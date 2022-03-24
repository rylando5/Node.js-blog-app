const mongoose = require('mongoose');
const domPurifier = require('dompurify'); 
const {JSDOM} = require('jsdom'); 
const htmlPurify = domPurifier(new JSDOM().window);  


const stripHtml = require('string-strip-html'); //stripping html tags out of text.



const contentSchema = new mongoose.Schema(
    {
       title:{
           type: String,
           required: true,
           unique: true,
       },
       content: {
           type: String,
           required: true,
           unique: true,
       },
       snippet: {
        type: String,
       }, 
       username: {
           type: String,
           required: true,
       }, 
       timeCreated:{
           type: Date,
           default:()=>Date.now,
       },
       img :{
           type: String,
           default: "",
       },
       tag: {
           type: String
       }

    }, 
    {timestamps: true}
)

contentSchema.pre('validate', function(next){
    if(this.content){
        this.content = htmlPurify.sanitize(this.content);
        this.snippet = stripHtml(this.content.substring(0,300)).result;
    }
    next()
})


module.exports = mongoose.model("content", contentSchema)