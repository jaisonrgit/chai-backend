import fs, { unlink } from "fs"

// A global file cleanup method for unexpected crash or error in controller
export default function globalFileCleanupHandler(err,req,res,next){
    if(req.file && req.file?.path){
        fs.unlink(req.file?.path)
    }
    else if(typeof req.files === "object"){
        for(const [_,array] of Object.entries(req.files)) {
            array.forEach(file => unlink(file.path,(error) => console.log({error})))
        }

    }
    return res
    .status(err.statusCode || 500)
    .json({...err,message : err?.message || "Something went wrong"})
}