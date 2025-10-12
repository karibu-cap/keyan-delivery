import cloudinary from "../../cloudinary";

// Fonction utilitaire
export async function uploadBase64DriverToCloudinary(base64: string) {
   const res = await cloudinary.uploader.upload(base64, {
      folder: "drivers",
   });
   return res.secure_url;
}

