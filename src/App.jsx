import React, { useState, useEffect, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import './index.css';

    function App() {
      const [image, setImage] = useState(null);
      const [description, setDescription] = useState('');
      const [uploadedImages, setUploadedImages] = useState([]);
      const [loading, setLoading] = useState(false);
      const [imageData, setImageData] = useState({});
      const [selectedImage, setSelectedImage] = useState(null);
      const fileInputRef = useRef(null);
      const [imageSelected, setImageSelected] = useState(false);
      const [previewUrl, setPreviewUrl] = useState(null);
      const [likedImages, setLikedImages] = useState({});
      const [showFlares, setShowFlares] = useState(false);

      useEffect(() => {
        // Load images from local storage on initial load
        const storedImages = localStorage.getItem('uploadedImages');
        if (storedImages) {
          setUploadedImages(JSON.parse(storedImages));
        }
        const storedImageData = localStorage.getItem('imageData');
        if (storedImageData) {
          setImageData(JSON.parse(storedImageData));
        }
        const storedLikedImages = localStorage.getItem('likedImages');
        if (storedLikedImages) {
          setLikedImages(JSON.parse(storedLikedImages));
        }
      }, []);

      const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImageSelected(true);

        // Generate preview URL
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setPreviewUrl(null);
        }
      };

      const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
      };

      const generateUniqueFilename = (file) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const fileExtension = file.name.split('.').pop();
        return `image_${timestamp}_${random}.${fileExtension}`;
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!image) {
          alert('Please select an image.');
          setLoading(false);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const filename = generateUniqueFilename(image);
          const newImageData = { ...imageData, [filename]: reader.result };
          setImageData(newImageData);

          const newImage = {
            id: Date.now(),
            src: filename,
            description: description,
          };

          const updatedImages = [...uploadedImages, newImage];
          setUploadedImages(updatedImages);
          localStorage.setItem('uploadedImages', JSON.stringify(updatedImages));
          localStorage.setItem('imageData', JSON.stringify(newImageData));
          setImage(null);
          setDescription('');
          setImageSelected(false);
          setPreviewUrl(null);
          setLoading(false);
          setShowFlares(true);
          setTimeout(() => setShowFlares(false), 1000);
        };

        reader.readAsDataURL(image);
      };

      const handleImageClick = (img) => {
        setSelectedImage(img);
      };

      const handleCloseImage = () => {
        setSelectedImage(null);
      };

      const handleFileInputClick = () => {
        fileInputRef.current.click();
      };

      const handleLike = (imgId) => {
        const newLikedImages = { ...likedImages, [imgId]: !likedImages[imgId] };
        setLikedImages(newLikedImages);
        localStorage.setItem('likedImages', JSON.stringify(newLikedImages));
      };

      const handleDoubleTap = (imgId) => {
        handleLike(imgId);
      };

      const reversedImages = [...uploadedImages].reverse();

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col justify-center items-center p-4 overflow-y-auto font-sans relative">
          {showFlares && (
            <motion.div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-50"></div>
            </motion.div>
          )}
          <div className="relative w-full max-w-4xl bg-white shadow-lg rounded-3xl p-8">
            <motion.h1
              className="text-3xl font-bold text-center text-gray-800 mb-8 font-serif"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Best Moment of 2024
            </motion.h1>
            <div className="mb-8 flex flex-col items-center">
              <div className="relative w-full max-w-md">
                <button
                  onClick={handleFileInputClick}
                  className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 ${imageSelected ? 'ring-2 ring-green-500' : ''}`}
                >
                  {imageSelected ? 'Image Selected' : 'Select Image'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="hidden"
                  ref={fileInputRef}
                />
                {previewUrl && (
                  <div className="mt-2 flex justify-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full h-32 object-cover rounded-md m-2" />
                  </div>
                )}
              </div>
              <div className="w-full max-w-md mb-4">
                <textarea
                  placeholder="Add a description"
                  value={description}
                  onChange={handleDescriptionChange}
                  className="border border-gray-300 rounded p-2 w-full resize-none h-24"
                />
              </div>
              <button type="submit" onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gallery</h2>
            {loading ? (
              <p className="text-center">Loading images...</p>
            ) : (
              <motion.div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {reversedImages.map((img) => (
                  <motion.div
                    key={img.id}
                    className="bg-white rounded-lg shadow-md p-2 cursor-pointer relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onDoubleClick={() => handleDoubleTap(img.id)}
                    >
                    <img src={imageData[img.src]} alt="Uploaded" className="w-full h-32 object-cover rounded-md" onClick={() => handleImageClick(img)} />
                    <p className="text-gray-700 text-center mt-2">{img.description}</p>
                    <div className="absolute top-2 right-2 flex items-center">
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={likedImages[img.id] ? 'red' : 'gray'}
                        className="w-6 h-6"
                        whileTap={{ scale: 1.2 }}
                        onClick={() => handleLike(img.id)}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
                      </motion.svg>
                      <span className="text-gray-600 ml-1">{likedImages[img.id] ? 1 : 0}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseImage}
              >
                <motion.img
                  src={imageData[selectedImage.src]}
                  alt="Full Screen"
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.5 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    export default App;
