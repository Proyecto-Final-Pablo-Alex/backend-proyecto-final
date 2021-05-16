const express = require('express');
const Chat = require('../models/Chat.model');
const router  = express.Router();

router.get("/return-all-chats/", (req, res)=>{
    Chat.find({participants: req.user._id})
    .populate("participants")
    .then(result => {
        res.send(result)
    })
    .catch(error => {
        console.log(error)
    })
})

router.get("/return-chat/:_id", (req, res)=>{
    const {_id} = req.params
    Chat.find({$and: [{participants: req.user._id},{participants: _id}]})
    .populate("participants")
    .then(conversation => {
        console.log(conversation)
        const updatedMessages = conversation[0].messages.map(msg=>{
            if(msg.status === "UNREAD" && msg.username !== req.user.username){
                msg.status = "READ"
            }
            return msg
        })
        Chat.findByIdAndUpdate(conversation[0]._id, {messages: updatedMessages}, {new: true})
        .then(result => {
            console.log(result)
            res.send(result)
        })
    })
    .catch(error => {
        console.log(error)
    }) 
})

router.post("/send-msg/:_id", (req, res)=>{
    const {_id} = req.params
    Chat.findOne({$and: [{participants: req.user._id},{participants: _id}]})
    .then(chat => {
        Chat.findByIdAndUpdate(chat._id, {$push: {messages: req.body}}, {new: true})
        .then(result => {
            console.log(result)
            res.send(result)
        })
    })
    .catch(error => {
        console.log(error)
    })
    
})

module.exports = router