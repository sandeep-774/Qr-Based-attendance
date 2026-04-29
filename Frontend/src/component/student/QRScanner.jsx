import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
  const fileInputRef = useRef(null);
  const qrRef = useRef(null);
  const isScanningRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      const html5QrCode = new Html5Qrcode("reader");
      qrRef.current = html5QrCode;

      try {
        const cameras = await Html5Qrcode.getCameras();
        const backCam =
          cameras.find((c) =>
            c.label.toLowerCase().includes("back")
          ) || cameras[0];

        await html5QrCode.start(
          backCam.id,
          { fps: 10, qrbox: 260 },
          (decodedText) => {
            if (isScanningRef.current) {
              isScanningRef.current = false;
              html5QrCode.stop().then(() => {
                navigate("/scan-result", {
                  state: { qrData: decodedText },
                });
              });
            }
          }
        );

        isScanningRef.current = true;
      } catch (e) {
        console.error(e);
      }
    };

    startCamera();

    return async () => {
      if (qrRef.current && isScanningRef.current) {
        try {
          await qrRef.current.stop();
          await qrRef.current.clear();
        } catch {}
        isScanningRef.current = false;
      }
    };
  }, [navigate]);

  // 📁 Scan from image
  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (qrRef.current && isScanningRef.current) {
        await qrRef.current.stop();
        await qrRef.current.clear();
        isScanningRef.current = false;
      }

      const tempScanner = new Html5Qrcode("reader");
      const result = await tempScanner.scanFile(file, true);
      await tempScanner.clear();

      navigate("/scan-result", {
        state: { qrData: result },
      });
    } catch {
      alert("QR not detected in image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white shadow-2xl rounded-3xl p-6 text-center">

        <h1 className="text-2xl font-bold text-gray-800">
          Scan Attendance QR
        </h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          Align QR in frame or upload image
        </p>

        <div className="relative flex justify-center">
          <div className="absolute w-[270px] h-[270px] border-4 border-indigo-500 rounded-2xl pointer-events-none z-10" />
          <div
            id="reader"
            className="w-[270px] h-[270px] rounded-2xl overflow-hidden"
          />
        </div>

        <div className="mt-5">
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm shadow-md transition"
          >
            Choose QR from Device
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileScan}
            className="hidden"
          />
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Camera is active. Point to QR code.
        </p>
      </div>
    </div>
  );
};

export default QRScanner;