import { useEffect, useRef, useState } from "react";
import { UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";

interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue) => void;
  disabled?: boolean;
}

const UploadWidget = ({ value = null, onChange, disabled = false }: UploadWidgetProps) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);

  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setPreview(value);
    if(!value) setDeleteToken(null);
  }, [value])

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange])

  useEffect(() => {
    if(typeof window === 'undefined') return;

    const initializeWidget = () => {
      if(!window.cloudinary || widgetRef.current) return false;
      
      // Guard: Don't initialize if Cloudinary constants are not configured
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.warn('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.');
        return false;
      }

      widgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        multiple: false,
        folder: 'uploads',
        maxFileSize: 5000000,
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      }, (error, result) => {
        if(!error && result.event === 'success') {
          const payload: UploadWidgetValue = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
          }
          setPreview(payload);

          setDeleteToken(result.info.delete_token ?? null);

          onChangeRef.current?.(payload);
        }
      })
      return true;
    }

    if(initializeWidget()) return;

    const intervalId = window.setInterval(() => {
      if(initializeWidget()) {
        window.clearInterval(intervalId);
      }
    }, 500)
    return () => window.clearInterval(intervalId);
  }, [])

  const openWidget = () => {
    if (!disabled) widgetRef.current?.open();
}

  const removeFromCloundinary = async () => {

  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="upload-preview"></div>
      ): <div 
      className="upload-dropzone"
      role="button"
      tabIndex={0}
      onClick={openWidget}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          openWidget();
        }
      }}
      >
        <div className="upload-prompt">
          <UploadCloud className="icon" />
          <div>
            <p>Click to upload photo</p>
            <p>JPG, PNG, up to 5 MB </p>
          </div> 
          </div>
      </div>}
    </div>
  )
}

export default UploadWidget;