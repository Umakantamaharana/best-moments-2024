const { v2: cloudinary } = require('cloudinary');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const multer = require('multer');

    cloudinary.config({
      cloud_name: 'YOUR_CLOUD_NAME',
      api_key: 'YOUR_API_KEY',
      api_secret: 'YOUR_API_SECRET',
    });

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'best-moments-2024',
        allowed_formats: ['jpg', 'jpeg', 'png'],
      },
    });

    const upload = multer({ storage: storage }).single('image');

    exports.handler = async (event) => {
      if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
      }

      return new Promise((resolve, reject) => {
        upload(event, {}, async (err) => {
          if (err) {
            console.error('Error uploading to Cloudinary:', err);
            return resolve({ statusCode: 500, body: 'Error uploading image' });
          }

          const { file } = event;
          const description = event.body.description;

          try {
            await cloudinary.uploader.add_context(
              { description: description },
              [file.filename]
            );

            resolve({
              statusCode: 200,
              body: JSON.stringify({
                public_id: file.filename,
                description: description,
              }),
            });
          } catch (error) {
            console.error('Error adding context to Cloudinary:', error);
            resolve({ statusCode: 500, body: 'Error adding context' });
          }
        });
      });
    };
