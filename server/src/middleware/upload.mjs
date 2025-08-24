// // src/middleware/upload.mjs
// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // change path if needed
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });


// // File filter
// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = /jpeg|jpg|png|gif/;
//   const extname = allowedFileTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedFileTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb(new Error("Error: Images Only! (jpeg, jpg, png, gif)"));
//   }
// };


// // Initialize upload
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 10 }, // 10MB max file size
//   fileFilter: fileFilter,
// });



// export default upload;

// src/middleware/upload.mjs
import multer from "multer";

// Store in memory instead of local disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extname = allowedFileTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) cb(null, true);
    else cb(new Error("Error: Images Only! (jpeg, jpg, png, gif)"));
  },
});

export default upload;
