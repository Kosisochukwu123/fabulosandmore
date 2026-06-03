import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiImage, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/ImageUploader.css';

const API_URL = import.meta.env.VITE_API_URL;


export default function ImageUploader({ productId, existingImages = [], onUpdated }) {
  const [images, setImages]       = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef                  = useRef(null);

  /* ---- Upload handler ---- */
  const handleFiles = async (files) => {
    if (!files?.length) return;
    if (!productId) {
      toast.error('Save the product first, then add images');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalid = Array.from(files).find(f => !validTypes.includes(f.type));
    if (invalid) {
      toast.error('Only JPG, PNG and WebP images are allowed');
      return;
    }

    const tooBig = Array.from(files).find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error('Each image must be under 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));

    try {
      const { data } = await axios.put(
        `${API_URL}/api/products/${productId}/images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded / e.total) * 100));
          },
        }
      );
      const updated = data.product?.images || [];
      setImages(updated);
      onUpdated?.(updated);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    }

    setUploading(false);
    setProgress(0);
    // Clear the file input so the same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ---- Remove image ---- */
  const removeImage = async (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    try {
      await axios.put(`${API_URL}/api/products/${productId}`, { images: updated });
      setImages(updated);
      onUpdated?.(updated);
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  /* ---- Set as main image ---- */
  const setMain = async (idx) => {
    if (idx === 0) return;
    const updated = [images[idx], ...images.filter((_, i) => i !== idx)];
    try {
      await axios.put(`${API_URL}/api/products/${productId}`, { images: updated });
      setImages(updated);
      onUpdated?.(updated);
      toast.success('Main image updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  /* ---- Drag events ---- */
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="img-uploader">

      {/* Drop zone */}
      <div
        className={`img-drop-zone ${uploading ? 'uploading' : ''} ${dragOver ? 'drag-over' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        aria-label="Upload images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="img-uploading">
            <div className="spinner" />
            <span>Uploading... {progress}%</span>
            {progress > 0 && (
              <div className="img-progress-bar" style={{ width: '160px' }}>
                <div className="img-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        ) : (
          <>
            <FiUpload className="img-drop-icon" />
            <div className="img-drop-text">
              <strong>Click to upload</strong> or drag & drop
            </div>
            <div className="img-drop-sub">JPG, PNG, WebP — max 5MB each · multiple allowed</div>
          </>
        )}
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <>
          <div className="img-preview-grid">
            {images.map((img, i) => (
              <div key={i} className="img-preview-item" title={i === 0 ? 'Main image' : 'Click ★ to set as main'}>
                <img
                  src={img.url}
                  alt={`Product image ${i + 1}`}
                  className="img-preview-thumb"
                />

                {/* Main badge */}
                {i === 0 && (
                  <span className="img-preview-main-badge">Main</span>
                )}

                {/* Set as main button */}
                {i !== 0 && (
                  <button
                    className="img-set-main-btn"
                    onClick={() => setMain(i)}
                    title="Set as main image"
                    aria-label="Set as main image"
                  >
                    ★
                  </button>
                )}

                {/* Remove button */}
                <button
                  className="img-preview-remove"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                >
                  <FiX size={11} />
                </button>
              </div>
            ))}

            {/* Add more button */}
            <button
              className="img-add-more-btn"
              onClick={() => inputRef.current?.click()}
              title="Add more images"
            >
              <FiUpload />
              <span>Add more</span>
            </button>
          </div>

          <div className="img-reorder-hint">
            <FiMove size={12} /> Click ★ on any image to make it the main product photo
          </div>
        </>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="img-no-images">
          <FiImage />
          <span>No images yet — upload above to add product photos</span>
        </div>
      )}
    </div>
  );
}