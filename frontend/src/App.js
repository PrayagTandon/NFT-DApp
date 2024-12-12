require('dotenv').config();
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { PinataSDK } from 'pinata-web3';


function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Wallet Connection Error:', error.message);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

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
        setGeneratedImage(data.image_url);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  const handleUploadToPinata = async () => {
    if (!generatedImage) {
      alert('No image generated to upload.');
      return;
    }

    try {
      const proxiedImageResponse = await fetch(
        `http://localhost:5000/api/fetch-image?imageUrl=${encodeURIComponent(generatedImage)}`
      );

      if (!proxiedImageResponse.ok) {
        throw new Error('Failed to fetch the image through proxy.');
      }

      const blob = await proxiedImageResponse.blob();
      const file = new File([blob], 'generated_image.png', { type: blob.type });

      const pinata = new PinataSDK({
        pinataJwt: process.env.REACT_APP_PINATA_JWT,
        pinataGateway: 'white-bright-ermine-612.mypinata.cloud',
      });

      // Upload file to Pinata
      const uploadResponse = await pinata.upload.file(file);
      setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${uploadResponse.IpfsHash}`);
      alert(`Image uploaded to IPFS: ${uploadResponse.IpfsHash}`);
    } catch (error) {
      console.error('Upload to Pinata Error:', error.message);
      alert('An error occurred while uploading the image to Pinata.');
    }
  };


  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated_image.png';
      link.click();
    }
  };

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      generateImage(prompt);
    } else {
      alert('Please enter a prompt!');
    }
  };

  return (
    <Box className="app" style={{ textAlign: 'center', padding: '20px' }}>
      <Box
        className="navbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Typography variant="h6">AIBL</Typography>
        <Button variant="contained" onClick={connectWallet}>
          {walletAddress ? `Connected: ${walletAddress.substring(0, 6)}...` : 'Connect Wallet'}
        </Button>
      </Box>

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

      {ipfsUrl && (
        <Typography style={{ marginTop: '10px' }}>
          IPFS URL: <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">{ipfsUrl}</a>
        </Typography>
      )}
    </Box>
  );
}

export default App;
