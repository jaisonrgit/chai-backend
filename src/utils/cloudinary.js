import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const deleteFileOnCloudinary = async (url="",options = {resource_type : "image"}) => { // deletion without an error for user
    if(!url.startsWith("http")){
        return null
    }
    try {
        console.log(url)
        const publicId = url.split("/")?.[url.split("/").length - 1]?.split(".")?.[0]
        console.log(publicId)
        if(!publicId) return null

        const result = await cloudinary.uploader.destroy(publicId,options)
        console.log(result)
    } catch (error) {
        return null
    }
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary,deleteFileOnCloudinary}