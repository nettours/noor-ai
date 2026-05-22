import { Router } from 'express';
import { register, login, refreshToken, me, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.get('/me', authMiddleware, me);
authRouter.post('/logout', authMiddleware, logout);
