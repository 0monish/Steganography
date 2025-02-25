import { useState, useRef } from 'react';
import cv from '@techstark/opencv-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

function App() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [encryptedImage, setEncryptedImage] = useState(null);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {

    // HANDLING IMAGE UPLOAD
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // HANDLING MESSAGE ENCRYPTION
  const encryptMessage = () => {
    if (!image || !message) {
      setErrorMessage('Please provide an image and a message.');
      return;
    } else {
      setErrorMessage('');
    }

    const imgElement = imageRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorMessage('Canvas element is not found.');
      return;
    }

    let mat = cv.imread(imgElement);
    const rows = mat.rows;
    const cols = mat.cols;

    let encryptedImage = mat.clone();

    let messageIndex = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (messageIndex < message.length) {
          const pixel = encryptedImage.ucharPtr(i, j);
          const charCode = message.charCodeAt(messageIndex);
          pixel[0] = charCode;
          messageIndex++;
        }
      }
    }

    cv.imshow(canvas, encryptedImage);
    setEncryptedImage(canvas.toDataURL());
    mat.delete();
  };

  // HANDLING MESSAGE DECRYPTION
  const decryptMessage = () => {
    if (!image) {
      setErrorMessage('Please provide an image.');
      return;
    }

    const imgElement = imageRef.current;

    let mat = cv.imread(imgElement);
    const rows = mat.rows;
    const cols = mat.cols;

    let decryptedMessage = '';

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const pixel = mat.ucharPtr(i, j);
        decryptedMessage += String.fromCharCode(pixel[0]);
      }
    }

    setDecryptedMessage(decryptedMessage);
    mat.delete();
  };

  // HANDLING THE ENCRYPTED IMAGE DOWNLOAD
  const handleDownload = () => {
    if (!encryptedImage) {
      setErrorMessage('No encrypted image to download.');
      return;
    }

    const link = document.createElement('a');
    link.href = encryptedImage;
    link.download = 'encrypted_image.png';
    link.click();
  };

  // HANDLING THE TAB CHANGES
  const handleTabChange = (value) => {

    setImage(null);
    setMessage('');
    setDecryptedMessage('');
    setErrorMessage('');
    setEncryptedImage(null);
  };

  return (
    <div className="container mx-auto p-5 ">
      <h1 className="text-3xl font-bold text-center mb-5">Securing Data with Steganography</h1>

      <Tabs
        defaultValue="encrypt"
        className="w-full max-w-[600px] mx-auto"
        onValueChange={handleTabChange}
      >
        <TabsList className="flex space-x-4 border-b w-full">
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
        </TabsList>

        {/* ENCRYPTION TAB */}
        <TabsContent value="encrypt">
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 rounded w-full"
              />
            </div>

            {image && (
              <div className="flex justify-center mb-5">
                <img ref={imageRef} src={image} alt="Uploaded" className="max-w-full h-auto" />
              </div>
            )}

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter secret message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

            <div className="flex justify-center mb-5">
              <Button
                onClick={encryptMessage}
                className="bg-blue-500 text-white px-5 py-2 rounded"
              >
                Encrypt Message
              </Button>
            </div>

            <div className="flex  flex-col items-center justify-center mb-5">
              <h1 className='text-2xl font-bold'>Original Image</h1>

              <canvas ref={canvasRef} className="w-full h-auto border border-gray-300 mt-5"></canvas>
            </div>


            {encryptedImage && (
              <>
                <div className="flex flex-col items-center justify-center mb-5 space-y-5">
                  <h1 className='text-2xl font-bold'>Encrypted Image</h1>

                  <img src={encryptedImage} alt="Encrypted Image" className="max-w-full h-auto" />
                </div>

                <div className="flex justify-center mb-5">
                  <Button
                    onClick={handleDownload}
                    className="bg-purple-500 text-white px-5 py-2 rounded"
                  >
                    Download Encrypted Image
                  </Button>
                </div>
              </>

            )}

          </div>
        </TabsContent>


        {/* DECRYPTION TAB */}
        <TabsContent value="decrypt">
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 rounded w-full"
              />
            </div>

            {image && (
              <div className="flex justify-center mb-5">
                <img ref={imageRef} src={image} alt="Uploaded" className="max-w-full h-auto" />
              </div>
            )}

            {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

            <div className="flex justify-center space-y-2">
              <Button
                onClick={decryptMessage}
                className="bg-green-500 text-white px-5 py-2 rounded"
              >
                Decrypt Message
              </Button>
            </div>

            {decryptedMessage && (
              <div className="space-y-2">
                <Textarea
                  value={decryptedMessage}
                  readOnly
                  rows={4}
                  className="border p-2 rounded w-full"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;