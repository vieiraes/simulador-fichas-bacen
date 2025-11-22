import { Router } from 'express';
import { DashboardController, PixController, ChavesController, RecargaController } from './controllers';

const router = Router();

router.use('/dashboard', DashboardController)
router.use('/pix', PixController)
router.use('/chave', ChavesController)
router.use('/recarga', RecargaController)

export { router }