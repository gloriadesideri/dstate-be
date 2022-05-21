const Building = require ('../models/Building')

exports.checkAdminRole = async (req, res, next) => {
    console.log(req.user)
    if(req.user.role!="admin"){
        return res.send(401, "Admin role required")
    }
    else{
        next();
    }
}
exports.checkForBuildingApproval = async (req, res ,next)=>{
    const building = await Building.findOne({_id: req.body.building_id})
    if(!building.approved){
        res.send(400, "building needs to be approved")
    }else{
        next()
    }

}

