import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from 'multer';

import uploadConfig from './config/multer.js';
import Regioes from "./models/regioes.js";
import Meliponicultores from "./models/meliponicultores.js";
import Meliponarios from "./models/meliponarios.js";

import { isAuthenticated } from "./middleware/auth.js";

const router = Router();

router.get('/', (req, res) => res.redirect('index/index.html'));

//router.get('/meliponarios?', async (req, res) => {
// const regioes = req.query.regioes;

// if (regioes) {
 //  Meliponario.ReadByregioes(regioes);
// const regioes = await Meliponario.ReadByregioes(regioes);
//   reg.style.display ="none"
 // } else {
//    Meliponario.readAll();
// }
 // const meliponarios = await Meliponario.readAll();
//res.json(regioes);
 // res.json(meliponarios);
// });

router.get('/meliponarios', async (req, res) => {
 try {
 const regioes = req.query.regioes;

   let meliponarios = [];

  if (regioes)
    meliponarios = await Meliponarios.ReadByregioes()
 else 
    meliponarios = await Meliponarios.readAll();

 res.json(meliponarios);
 } catch(error) {
    throw new Error('Error in list meliponarios');
  }
});

router.post(
  '/meliponarios',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  async (req, res) => {
    try {
      const meliponario = req.body;

      const image = req.file
        ? `/meliponario/img/${req.file.filename}`
        : '/meliponario/img/meliponario2.jpg';

      const newMeliponario = await Food.create({ ...food, image });

      res.json(newMeliponario);
    } catch (error) {
      throw new Error('Error in create Meliponário');
    }
  }
);

router.put(
  '/meliponarios/:id',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const meliponario = req.body;

      const image = req.file
        ? `/imgs/foods/${req.file.filename}`
        : '/imgs/foods/placeholder.jpg';

      const newMeliponario = await Meliponario.update({ ...meliponario, image }, id);

      if (newMeliponario) {
        res.json(newMeliponario);
      } else {
        res.status(400).json({ error: 'Meliponário not found.' });
      }
    } catch (error) {
      throw new Error('Error in update Meliponário');
    }
  }
);


router.delete('/meliponarios/:id', isAuthenticated, async (req, res) => {
   try {
  const id = Number(req.params.id);

  if (await Meliponarios.destroy(id)) {
    res.status(204).send();
  } else {
    res.status(400).json({ error: 'Meliponário não encontrado.' });
  }
 } catch(error) {
    throw new Error('Error in delete meliponarios');
 }
});

router.get('/regioes', isAuthenticated, async (req, res) => {
  try {
  const regioes = await Regioes.readAll();

  res.json(regioes);
   } catch(error) {
    throw new Error('Error in list regioes');
  }  
});

router.post('/meliponicultores', async (req, res) => {
  try {
    const meliponicultor = req.body;

    const newMeliponicultor = await Meliponicultores.create(meliponicultor);

    res.json(newMeliponicultor);
  } catch(error) {
    console.log(error);
    throw new Error('Error in create user');
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const meliponicultor = await Meliponicultores.readByEmail(email);
    
    if (!meliponicultor) {
      throw new Error('User not found');
    }
    
    const { id_meliponicultor: userId, password: hash } = meliponicultor;
    
    const match = await bcrypt.compareSync(senha, hash);
    
    if (match) {
      const token = jwt.sign(
        { userId },
        process.env.SECRET,
        { expiresIn: 3600 } // 1h
      );

      res.json({ auth: true, token });
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(401).json({ error: 'User not found' });
  }
});

router.use(function (req, res, next) {
  res.status(404).json({
    message: 'Content not found',
  });
});

router.use(function (error, req, res, next) {
  console.error(error.stack);

  res.status(500).json({
    message: 'Something broke!',
  });
});

export default router;