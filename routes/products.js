import Category from '../models/category.js';
import  Product  from '../models/product.js';
import express  from "express";
import mongoose from "mongoose";
import multer from 'multer';
const router = express.Router();


const FILE_TYPE_MAP ={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if(isValid){
            uploadError =null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('_')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  const uploadOptions = multer({ storage: storage })


router.get(`/`, async (req, res) =>{
    
    let filter= {};
    if(req.query.categories){
        filter ={category :req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    // const productList = await Product.find().select('name');
    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})

router.get(`/get/count`, async (req, res) =>{
    
    try {
        const productCount = await Product.countDocuments();
        res.send({ productCount: productCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count:0
    const products = await Product.find({isFeatured:true}).limit(+count)

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products)
})

router.post(`/`,uploadOptions.single('image'), async (req, res) => {
    const  category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const file=req.file
    if(!file) return res.status(400).send('No image in the request')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription:req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand:req.body.brand,
        price: req.body.price,
        category:req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    const savedProduct  = await newProduct.save();
    if(!savedProduct)
    return res.status(500).send('The product cannot be created')
    return res.send(savedProduct)

    
});

router.put('/:id', async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid product id')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription:req.body.richDescription,
            image: req.body.image,
            brand:req.body.brand,
            price: req.body.price,
            category:req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,

        },
        {new:true}
    )
    if(!product)
    return res.status(500).send('The category cannot be created!')
    res.send(product)
})

router.delete('/:id', (req,res)=>{
    Product.findByIdAndDelete(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({success: true, message: 'the category is deleted'})
        } else{
            return res.status(404).json({success: false, message: 'category not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid product id');
    }
    
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    if (Array.isArray(files) && files.length > 0) {
        files.forEach(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product) {
            return res.status(500).send('The product cannot be updated!');
        }

        res.send(product);
    } catch (error) {
        console.error('Error updating product images:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
export default router;