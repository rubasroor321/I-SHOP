import Order from '../models/order.js ';
import express from "express";
import OrderItem from '../models/order-item.js';

const router = express.Router();

router.get(`/`, async (req, res) =>{
    
    const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});
    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})
router.get(`/get/totalsales`, async (req, res) =>{
    const totalSales = await Order.aggregate([
        {$group:{_id:null , totalsales : {$sum: '$totalPrice'}}}
    ])

    
    if(!totalSales) {
       return res.status(400).send('THe order sales cannot be generated')
    } 
    res.send ({totalsales : totalSales.pop().totalsales});
})
router.get(`/get/count`, async (req, res) =>{
    
    try {
        const orderCount = await Order.countDocuments();
        res.send({ orderCount: orderCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
router.get(`/get/userorders/:userid`, async (req, res) =>{
    
    const userOrderList = await Order.find({user:req.params.userid}).populate({
        path: 'orderItems',populate:{
            path:'product',populate:'category'
        }
    }).sort({'dateOrdered': -1});
    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

router.post('/', async(req,res)=>{
    try{
        const orderItemsIds =Promise.all(req.body.orderItems.map( async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product','price')
        const totalPrice =orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    console.log(totalPrices);
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let  order= new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })
    order = await order.save();

    if(!order)
    return res.status(404).send('the order cannot be created!')
    res.send(order);}
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
})


router.put('/:id', async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {status: req.body.status,},
        {new:true}
    )
    if(!order)
    return res.status(400).send('The order cannot be updated!')
    res.send(order)
})


router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (order) {
            await OrderItem.deleteMany({ _id: { $in: order.orderItems } });

            return res.status(200).json({ success: true, message: 'The order is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

export default router;