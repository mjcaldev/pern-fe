import { useEffect, useRef, useState } from "react";
import { UploadWidgetProps } from "@/types";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const UploadWidget = ({ value, onChange, disabled }: UploadWidgetProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const cloudinaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Cloudinary script if not already loaded
    if (!window.cloudinary && CLOUDINARY_CLOUD_NAME) {
      const script = document.createElement("script");
      script.src = `https://widget.cloudinary.com/v2.0/global/all.js`;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeWidget();
      };
    } else if (window.cloudinary && CLOUDINARY_CLOUD_NAME) {
      initializeWidget();
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, []);

  const initializeWidget = () => {
    if (!window.cloudinary || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.warn("Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        multiple: false,
        resourceType: "image",
        cropping: false,
      },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          setIsLoading(false);
          return;
        }

        if (result && result.event === "success") {
          const uploadResult = result.info;
          if (onChange) {
            onChange({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            });
          }
          setIsLoading(false);
        } else if (result && result.event === "queues-end") {
          setIsLoading(false);
        } else if (result && result.event === "show") {
          setIsLoading(true);
        }
      }
    );
  };

  const handleUploadClick = () => {
    if (widgetRef.current && !disabled) {
      widgetRef.current.open();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange && !disabled) {
      onChange(null);
    }
  };

  // If Cloudinary is not configured, show a fallback message
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return (
      <div className="upload-dropzone" style={{ opacity: 0.5 }}>
        <div className="upload-prompt">
          <div>
            <div>Cloudinary not configured</div>
            <div>Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file</div>
          </div>
        </div>
      </div>
    );
  }

  // Show preview if image is uploaded
  if (value?.url) {
    return (
      <div className="upload-preview">
        <img src={value.url} alt="Upload preview" />
        {!disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Show upload dropzone
  return (
    <div
      className="upload-dropzone"
      onClick={handleUploadClick}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div className="upload-prompt">
        <Upload className="icon" />
        <div>
          <div>Click to upload</div>
          <div>PNG, JPG, JPEG, or WEBP (max 3MB)</div>
        </div>
      </div>
    </div>
  );
};

export default UploadWidget;
