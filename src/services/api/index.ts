// src/services/api/index.ts
import express from 'express';
import { openaiHandler } from './openai';

const router = express.Router();

router.post('/openai', openaiHandler);

export default router;