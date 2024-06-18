function errorHandler(err ,req, res ,next ){
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({message : "The user is not unauthorized"})
    }
    
    if(err.name === 'ValidationError'){
        res.status(400).json({message : err})
    }

    return res.status(500).json(err);
}
// export default errorHandler