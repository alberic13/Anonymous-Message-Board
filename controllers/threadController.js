'use strict';

const threadService = require('../services/threadService');

async function createThread(req, res) {
  try {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    if (!text || !delete_password) {
      return res.status(400).send('text and delete_password are required');
    }

    const newThread = await threadService.createThread(board, text, delete_password);

    if (req.headers.accept && req.headers.accept.startsWith('text/html') && !req.xhr) {
      return res.redirect(`/b/${board}/`);
    }

    return res.json(newThread);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function getThreads(req, res) {
  try {
    const { board } = req.params;
    const threads = await threadService.getThreads(board);
    return res.json(threads);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function reportThread(req, res) {
  try {
    const { board } = req.params;
    const thread_id = req.body.thread_id || req.body.report_id;

    if (!thread_id) {
      return res.status(400).send('thread_id is required');
    }

    const result = await threadService.reportThread(board, thread_id);
    return res.send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function deleteThread(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;

    if (!thread_id || !delete_password) {
      return res.status(400).send('thread_id and delete_password are required');
    }

    const result = await threadService.deleteThread(board, thread_id, delete_password);
    return res.send(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

module.exports = {
  createThread,
  getThreads,
  reportThread,
  deleteThread
};
