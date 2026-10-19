'use strict';

const replyService = require('../services/replyService');
const threadService = require('../services/threadService');

async function createReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, text, delete_password } = req.body;

    if (!thread_id || !text || !delete_password) {
      return res.status(400).send('thread_id, text, and delete_password are required');
    }

    const reply = await replyService.createReply(board, thread_id, text, delete_password);
    if (!reply) {
      return res.status(404).send('thread not found');
    }

    if (req.headers.accept && req.headers.accept.startsWith('text/html') && !req.xhr) {
      return res.redirect(`/b/${board}/${thread_id}`);
    }

    return res.json(reply);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function getReplies(req, res) {
  try {
    const { board } = req.params;
    const thread_id = req.query.thread_id || req.body.thread_id;

    if (!thread_id) {
      return res.status(400).send('thread_id is required');
    }

    const thread = await threadService.getThread(board, thread_id);
    if (!thread) {
      return res.status(404).send('thread not found');
    }

    return res.json(thread);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function reportReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, reply_id } = req.body;

    if (!thread_id || !reply_id) {
      return res.status(400).send('thread_id and reply_id are required');
    }

    const result = await replyService.reportReply(board, thread_id, reply_id);
    return res.send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function deleteReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;

    if (!thread_id || !reply_id || !delete_password) {
      return res.status(400).send('thread_id, reply_id, and delete_password are required');
    }

    const result = await replyService.deleteReply(board, thread_id, reply_id, delete_password);
    return res.send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

module.exports = {
  createReply,
  getReplies,
  reportReply,
  deleteReply
};
