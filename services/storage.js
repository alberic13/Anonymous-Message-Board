'use strict';

const mongoose = require('mongoose');
const Thread = require('../models/Thread');

// Connect to MongoDB if environment variable is provided
const mongoUri = process.env.DB || process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.warn('MongoDB connection failed, falling back to memory store:', err.message));
}

// In-memory fallback storage
const memoryStore = [];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function formatThreadForBoard(thread) {
  const replies = (thread.replies || [])
    .slice(-3)
    .map(r => ({
      _id: r._id.toString(),
      text: r.text,
      created_on: r.created_on
    }));

  return {
    _id: thread._id.toString(),
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies: replies,
    replycount: thread.replies ? thread.replies.length : 0
  };
}

function formatThreadWithAllReplies(thread) {
  const replies = (thread.replies || []).map(r => ({
    _id: r._id.toString(),
    text: r.text,
    created_on: r.created_on
  }));

  return {
    _id: thread._id.toString(),
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies: replies
  };
}

module.exports = {
  Thread,
  memoryStore,
  isMongoConnected,
  formatThreadForBoard,
  formatThreadWithAllReplies
};
