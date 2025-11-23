import { Router } from 'express';
import { DashboardController, PixController, ChavesController, RecargaController } from './controllers';
import path from 'path';

const router = Router();

router.use('/dashboard', DashboardController)
router.use('/pix', PixController)
router.use('/chave', ChavesController)
router.use('/recarga', RecargaController)

// Endpoint para download da Postman Collection
router.get('/postman-collection', (req, res) => {
  const filePath = path.join(__dirname, '../../postman_collection.json');
  res.download(filePath, 'Simulador_Fichas_Bacen.postman_collection.json');
});

export { router }