import React, { useState, useCallback } from 'react';
import { Modal, Button, Slider } from '@mantine/core'; // Using Mantine for Slider, adjust if needed
import Cropper, { Area, Point } from 'react-easy-crop';
import getCroppedImg, { PixelCrop } from '../../utils/cropImage'; // Adjust path if necessary

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  isOpen,
  onClose, 
  imageSrc, 
  onCropComplete 
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropPixelsComplete = useCallback((_croppedArea: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels as PixelCrop);
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
      // Handle error (e.g., show toast message)
    } finally {
      setIsCropping(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Modal opened={isOpen} onClose={onClose} title="Crop Image" size="lg">
      <div style={{ position: 'relative', width: '100%', height: 400 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // Square aspect ratio for profile pictures
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropPixelsComplete}
        />
      </div>
      <div style={{ padding: '16px 0' }}>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(value: number) => setZoom(value)}
          label={(value: number) => `Zoom: ${value.toFixed(1)}`}
          style={{ marginBottom: '16px'}}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button variant="default" onClick={onClose} disabled={isCropping}>
          Cancel
        </Button>
        <Button onClick={handleCrop} loading={isCropping} disabled={!croppedAreaPixels}>
          Crop & Save
        </Button>
      </div>
    </Modal>
  );
};

export default ImageCropperModal; 