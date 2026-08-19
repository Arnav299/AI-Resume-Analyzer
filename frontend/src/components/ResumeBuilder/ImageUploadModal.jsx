import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { X, Check } from 'lucide-react';

const ImageUploadModal = ({ imageSrc, onSave, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0
      );
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-hover rounded-2xl w-full max-w-md border border-border-default shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-default bg-surface">
          <h3 className="text-content-primary font-semibold text-lg">Crop Image</h3>
          <button onClick={onClose} className="text-content-primary/50 hover:text-content-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative w-full h-64 sm:h-80 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-6 bg-surface">
          <div className="mb-6">
            <label className="text-xs font-semibold text-content-primary/50 uppercase tracking-wider mb-2 block">
              Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full accent-[#6C63FF]"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-content-primary/70 hover:bg-surface/5 border border-border-default transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-content-primary shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-all hover:shadow-[0_0_25px_rgba(108,99,255,0.6)]"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
            >
              <Check size={16} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
