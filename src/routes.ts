import { Router } from 'express';
import { PixController, ChavesController, BaldesController } from './api/controllers';

const router = Router();


router.use('/pix', PixController)
router.use('/chave', ChavesController)
router.use('/balde', BaldesController)

export { router }
