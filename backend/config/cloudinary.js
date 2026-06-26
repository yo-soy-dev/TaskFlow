import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

console.log("\n========== CLOUDINARY ENV ==========");
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
});
console.log("====================================");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Print loaded config
console.log("\n========== CLOUDINARY CONFIG ==========");
console.log(cloudinary.config());
console.log("=======================================");

// Test Cloudinary connection on server startup
(async () => {
  try {
    console.log("\n========== CLOUDINARY PING ==========");

    const result = await cloudinary.api.ping();

    console.log("✅ Ping Success");
    console.log(result);

    console.log("=====================================");
  } catch (err) {
    console.log("\n========== CLOUDINARY PING ERROR ==========");

    console.error(err);

    console.log("Message:", err.message);
    console.log("Name:", err.name);
    console.log("HTTP Code:", err.http_code);

    if (err.response) {
      console.dir(err.response, { depth: null });
    }

    console.log("==========================================");
  }
})();



export const uploadToCloudinary = (
  buffer,
  folder = "taskflow",
  filename = "",
  mimetype = "application/octet-stream"
) => {
  return new Promise((resolve, reject) => {
    console.log("\n========== UPLOAD START ==========");
    console.log("Folder:", folder);
    console.log("Filename:", filename);
    console.log("Buffer Exists:", !!buffer);
    console.log("Buffer Size:", buffer?.length);

    // const isImage = mimetype.startsWith("image/");
    // const isPdf = mimetype === "application/pdf";
    const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  return "raw"; 
};


    const options = {
      folder,
      resource_type: getResourceType(mimetype),
      public_id: filename
        ? `${Date.now()}_${path.parse(filename).name.replace(/[\s()]/g, '_')}`
        : undefined,
    };

    console.log("Upload Options:");
    console.dir(options);

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.log("\n========== CLOUDINARY UPLOAD ERROR ==========");

          console.error(error);

          console.log("Message:", error.message);
          console.log("Name:", error.name);
          console.log("HTTP Code:", error.http_code);

          if (error.response) {
            console.dir(error.response, { depth: null });
          }

          console.log("============================================");

          return reject(error);
        }

        console.log("\n========== CLOUDINARY UPLOAD SUCCESS ==========");
        console.log("Public ID:", result.public_id);
        console.log("Secure URL:", result.secure_url);
        console.log("Resource Type:", result.resource_type);
        console.log("Bytes:", result.bytes);
        console.log("==============================================");

        resolve(result);
      }
    );

    const readable = new Readable();

    readable.push(buffer);
    readable.push(null);

    readable.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "auto"
) => {
  try {
    console.log("\n========== DELETE START ==========");
    console.log("Public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Delete Result:", result);
    console.log("==================================");
  } catch (err) {
    console.log("\n========== DELETE ERROR ==========");

    console.error(err);

    console.log("Message:", err.message);
    console.log("HTTP Code:", err.http_code);

    console.log("==================================");
  }
};

export { cloudinary };