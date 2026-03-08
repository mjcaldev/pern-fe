import { useEffect, useRef, useState } from "react";
import { UploadWidgetValue } from "@/types";
import { Trash2, UploadCloud } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { toast } from "sonner";

function safeJson(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function extractCloudinaryErrorMessage(error: unknown, result?: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "Unknown error";

  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;
    const response = (e.response as Record<string, unknown> | undefined) ?? undefined;
    const responseError = (response?.error as Record<string, unknown> | undefined) ?? undefined;

    const direct = pickFirstString(e.message, e.error, e.statusText);
    const nested = pickFirstString(
      responseError?.message,
      (responseError as any)?.details,
      response?.message
    );

    return direct ?? nested ?? "Unknown error";
  }

  // Sometimes the widget reports the error in the `result` payload.
  if (typeof result === "object" && result !== null) {
    const r = result as Record<string, unknown>;
    const info = (r.info as Record<string, unknown> | undefined) ?? undefined;
    const infoError = (info?.error as Record<string, unknown> | undefined) ?? undefined;

    const fromResult = pickFirstString(r.message, info?.message, infoError?.message);
    if (fromResult) return fromResult;
  }

  return "Unknown error";
}

interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
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

      console.info("[CloudinaryUploadWidget] initializing", {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      });
      console.info(
        "[CloudinaryUploadWidget] expected info endpoint:",
        `https://widget.cloudinary.com/info/${CLOUDINARY_CLOUD_NAME}.json`
      );

      widgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        multiple: false,
        folder: 'uploads',
        maxFileSize: 5000000,
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
      }, (error, result) => {
        if (error) {
          // Cloudinary returns a *much* more descriptive message here than the
          // browser's "Failed to load resource" console line.
          const message = extractCloudinaryErrorMessage(error, result);
          const errorJson = safeJson(error);
          const resultJson = safeJson(result);

          console.error("[CloudinaryUploadWidget] upload error message:", message);
          console.error("[CloudinaryUploadWidget] upload error raw:", error);
          if (errorJson) console.error("[CloudinaryUploadWidget] upload error json:", errorJson);
          if (resultJson) console.error("[CloudinaryUploadWidget] upload result json:", resultJson);

          toast.error("Image upload failed", { description: message });
          return;
        }

        if (result?.event === 'success') {
          const payload: UploadWidgetValue = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
          }
          setPreview(payload);

          setDeleteToken(result.info.delete_token ?? null);

          onChangeRef.current?.(payload);
          return;
        }

        // If Cloudinary reports an error event without the `error` arg populated,
        // surface it anyway.
        if (result?.event === "error") {
          const message = extractCloudinaryErrorMessage(undefined, result);
          console.error("[CloudinaryUploadWidget] upload error event:", result);
          toast.error("Image upload failed", { description: message });
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
        <div className="relative w-full overflow-hidden rounded-xl border bg-card">
          <img
            src={preview.url}
            alt="Uploaded image"
            className="h-44 w-full object-cover"
          />
          <button
            type="button"
            onClick={removeFromCloundinary}
            disabled={isRemoving}
            className={[
              "absolute right-2 top-2 z-10 inline-flex items-center justify-center",
              "h-9 w-9 rounded-md border bg-background/70 backdrop-blur",
              "text-foreground hover:bg-background/85 transition-colors",
              "disabled:opacity-60 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            ].join(" ")}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <div
          className={[
            "w-full rounded-xl border border-dashed",
            "bg-muted/15 hover:bg-muted/25 transition-colors",
            "px-6 py-10",
            "cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled ? "opacity-60 pointer-events-none" : "",
          ].join(" ")}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openWidget}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openWidget();
            }
          }}
        >
          <div className="mx-auto flex max-w-md items-center justify-center gap-3 text-center">
            <UploadCloud className="h-9 w-9 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-primary">Click to upload photo</p>
              <p className="text-sm text-muted-foreground">PNG, JPG up to 5 MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadWidget;