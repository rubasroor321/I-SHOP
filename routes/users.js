import  User  from '../models/user.js';
import express  from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();

router.get(`/`, async (req, res) =>{
    
    const usertList = await User.find().select('-passwordHash');

    if(!usertList) {
        res.status(500).json({success: false})
    } else{
        res.send(usertList);
    }
    
})
router.get('/:id', async(req,res)=>{
    const user =await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({message:'The user with the ID was not found.'})
    }
    res.status(200).send(user)
})

router.get(`/get/count`, async (req, res) =>{
    
    try {
        const userCount = await User.countDocuments();
        res.send({ userCount: userCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

router.post('/', async(req,res)=>{
    let  user= new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('the user cannot be created!')
    res.send(user);
})

router.post('/login', async(req,res)=>{
    
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.Secret
    if(!user){
        return res.status(400).send('The user not found');
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        {expiresIn:'2d'}
        )
        res.status(200).send({user:user.email , token : token})
    }else{
        res.status(400).send('password is wrong!')
    }
    
})

router.post('/register', async(req,res)=>{
    let  user= new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('the user cannot be created!')
    res.send(user);
})
router.delete('/:id', (req,res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({success: true, message: 'the user is deleted'})
        } else{
            return res.status(404).json({success: false, message: 'user not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

export default router;   
