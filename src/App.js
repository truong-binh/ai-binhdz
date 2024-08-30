import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageShape, setImageShape] = useState('square');
  const YOUR_API_KEY = 'sk-pGTz6mmmPScW9IOo3QrUPYYzyNsLqS7iF7CfvWd3uwBQ5wad';

  const translateText = async (text) => {
    try {
      const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=vi|en`);
      return response.data.responseData.translatedText;
    } catch (error) {
      console.error('Lỗi khi dịch:', error);
      return text;
    }
  };

  const generateImage = async () => {
    setLoading(true);
    try {
      const translatedPrompt = await translateText(prompt);
      console.log('Prompt đã dịch:', translatedPrompt);

      let width, height;
      switch (imageShape) {
        case 'square':
          width = height = 1024;
          break;
        case 'landscape':
          width = 1152;
          height = 896;
          break;
        case 'portrait':
          width = 896;
          height = 1152;
          break;
        default:
          width = height = 1024;
      }

      const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        text_prompts: [{ text: translatedPrompt }],
        cfg_scale: 7,
        height: height,
        width: width,
        steps: 30,
        samples: 1,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${YOUR_API_KEY}`
        }
      });
      
      console.log('Phản hồi từ API:', response.data);
      
      if (response.data.artifacts && response.data.artifacts[0].base64) {
        setImage(`data:image/png;base64,${response.data.artifacts[0].base64}`);
      } else {
        console.error('Không tìm thấy dữ liệu ảnh trong phản hồi');
      }
    } catch (error) {
      console.error('Lỗi khi tạo ảnh:', error);
      if (error.response) {
        console.error('Dữ liệu phản hồi:', error.response.data);
        console.error('Mã trạng thái:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Không nhận được phản hồi:', error.request);
      } else {
        console.error('Lỗi:', error.message);
      }
    }
    setLoading(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'ai_generated_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <h1>Tạo ảnh bằng AI</h1>
      <div className="input-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Nhập mô tả ảnh bằng tiếng Việt..."
        />
        <button onClick={generateImage} disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo ảnh'}
        </button>
      </div>
      <div className="shape-options">
        <label>
          <input
            type="radio"
            value="square"
            checked={imageShape === 'square'}
            onChange={(e) => setImageShape(e.target.value)}
          />
          Ảnh vuông (1024x1024)
        </label>
        <label>
          <input
            type="radio"
            value="landscape"
            checked={imageShape === 'landscape'}
            onChange={(e) => setImageShape(e.target.value)}
          />
          Chữ nhật ngang (1152x896)
        </label>
        <label>
          <input
            type="radio"
            value="portrait"
            checked={imageShape === 'portrait'}
            onChange={(e) => setImageShape(e.target.value)}
          />
          Chữ nhật dọc (896x1152)
        </label>
      </div>
      {image && (
        <div className="image-container">
          <img src={image} alt="Ảnh được tạo bởi AI" />
          <button onClick={downloadImage} className="download-button">Tải ảnh về</button>
        </div>
      )}
    </div>
  );
}

export default App;
