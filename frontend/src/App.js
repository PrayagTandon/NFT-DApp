import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  // Generate image from backend
  async function generateImage(prompt) {
    try {
      const response = await fetch('http://localhost:5000/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.image_url); // Save image URL to state
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  // Download the image
  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated_image.png';
      link.click();
    }
  };

  // Placeholder for upload to Pinata (Pinata configuration will be done later)
  const handleUploadToPinata = () => {
    alert('Upload to Pinata functionality will be added soon!');
  };

  // Event handler for Generate button
  const handleGenerateClick = () => {
    if (prompt.trim()) {
      generateImage(prompt);
    } else {
      alert('Please enter a prompt!');
    }
  };

  return (
    <Box className="app" style={{ textAlign: 'center', padding: '20px' }}>
      <Typography variant="h4" component="h1" className="header">
        <p>AIBL <br /> (Where AI's creativity meets Blockchain security)</p>
      </Typography>

      <TextField
        variant="outlined"
        placeholder="Write a Prompt to generate an image"
        className="textBox"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ marginBottom: '20px', width: '50%' }}
      />

      <Button variant="contained" onClick={handleGenerateClick}>
        Generate
      </Button>

      {generatedImage && (
        <Box style={{ marginTop: '20px', textAlign: 'center' }}>
          <img
            src={generatedImage}
            alt="Generated"
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
          />
          <Box>
            <Button
              variant="contained"
              color="secondary"
              style={{ marginRight: '10px' }}
              onClick={handleUploadToPinata}
            >
              Upload to Pinata
            </Button>
            <Button variant="outlined" onClick={handleDownloadImage}>
              Download
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default App;
