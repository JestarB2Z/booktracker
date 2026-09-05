"use client";

import { useEffect, useRef, useState } from "react";

interface ScannerClientProps {
  onDetected: (isbn: string) => void;
  onCancel: () => void;
}

function isPlausibleIsbn(text: string) {
  const digits = text.replace(/[^0-9]/g, "");
  return digits.length === 10 || digits.length === 13;
}

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

export function ScannerClient({ onDetected, onCancel }: ScannerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const detectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId: number | null = null;
    let stopZxing: (() => void) | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const BarcodeDetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
          }
        ).BarcodeDetector;

        if (BarcodeDetectorCtor) {
          const detector = new BarcodeDetectorCtor({ formats: ["ean_13", "ean_8", "upc_a"] });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const tick = async () => {
            if (cancelled || detectedRef.current || !videoRef.current) return;
            const video = videoRef.current;
            if (video.videoWidth && ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              try {
                const codes = await detector.detect(canvas);
                if (codes.length > 0 && isPlausibleIsbn(codes[0].rawValue)) {
                  detectedRef.current = true;
                  onDetectedRef.current(codes[0].rawValue.replace(/[^0-9]/g, ""));
                  return;
                }
              } catch {
                // transient detection error — keep scanning
              }
            }
            rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
        } else {
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          const reader = new BrowserMultiFormatReader();
          const controls = await reader.decodeFromVideoElement(videoRef.current, (result) => {
            if (result && !detectedRef.current) {
              const text = result.getText();
              if (isPlausibleIsbn(text)) {
                detectedRef.current = true;
                controls.stop();
                onDetectedRef.current(text.replace(/[^0-9]/g, ""));
              }
            }
          });
          stopZxing = () => controls.stop();
        }
      } catch (err) {
        setError(err instanceof Error ? `Camera error: ${err.message}` : "Couldn't access the camera");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      stopZxing?.();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={onCancel} className="rounded-lg border border-zinc-300 py-3 dark:border-zinc-700">
        Cancel
      </button>
    </div>
  );
}
