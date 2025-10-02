import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
 eventTitle:{
    type:String,
    required: true,
    trim:true
 },
 eventDate:{
    type:Date,
    required:true
 },
 time:{
    type:String,
    required: true
 },
 venue:{
    type:String,
    required: true
 },
 ticketType:{
    type:String,
    default:"NORMAL",
    enum:["VIP","NORMAL"],
    required:true
 },
 quantity:{
    type:Number,
    required:true
 },
 amount:{
  type:Number,
  required:true
 },
 paymentStatus:{
    type:String,
    required:true,
    enum:["Paid","Free"]
 },
 qrCodeData:{
    type:String,
    default:null
 }
},{
    timestamps:true
})

const TicketModel = mongoose.model("Ticket", ticketSchema)

export default TicketModel;