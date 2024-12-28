const { v2: cloudinary } = require('cloudinary');

    cloudinary.config({
      cloud_name: 'YOUR_CLOUD_NAME',
      api_key: 'YOUR_API_KEY',
      api_secret: 'YOUR_API_SECRET',
    });

    exports.handler = async () => {
      try {
        const { resources } = await cloudinary.search
          .expression('folder:best-moments-2024')
          .sort_by('created_at', 'desc')
          .max_results(30)
          .execute();

        const images = resources.map((resource) => ({
          public_id: resource.public_id,
          description: resource.context?.description || '',
        }));

        return {
          statusCode: 200,
          body: JSON.stringify(images),
        };
      } catch (error) {
        console.error('Error fetching images from Cloudinary:', error);
        return {
          statusCode: 500,
          body: 'Error fetching images',
        };
      }
    };
