import React, { useRef, useEffect, useState } from 'react';
import { Camera, Maximize2, RefreshCw, Eye } from 'lucide-react';

const VideoCanvas = ({ cameraId = 'CAM-01', cameraName = 'Camera 01', riskLevel = 'LOW', vehicleCount = 14, isMonitored = true }) => {
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(30);
  const [frameId, setFrameId] = useState(104820);
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    // Simulated traffic vehicles in this camera stream
    const vehicles = [
      { id: 'V-101', type: 'Car', lane: 1, y: 50, speed: 1.8, dir: 1, baseSpeed: 52, risk: 20 },
      { id: 'V-104', type: 'Car', lane: 2, y: 140, speed: 2.4, dir: 1, baseSpeed: 68, risk: riskLevel === 'HIGH' ? 88 : 28 },
      { id: 'V-108', type: 'Car', lane: 2, y: 260, speed: -1.6, dir: -1, baseSpeed: 74, risk: 94, isWrongWay: riskLevel === 'HIGH' },
      { id: 'V-112', type: 'Auto', lane: 3, y: 90, speed: 1.2, dir: 1, baseSpeed: 38, risk: 24 },
      { id: 'V-118', type: 'Bus', lane: 1, y: 220, speed: 1.1, dir: 1, baseSpeed: 42, risk: 35 },
      { id: 'V-122', type: 'Bike', lane: 3, y: 190, speed: 2.1, dir: 1, baseSpeed: 49, risk: 18 }
    ];

    let lastTime = performance.now();

    const render = (time) => {
      if (!isMonitored) {
        // Draw standby / offline screen
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA STANDBY • MONITORING PAUSED', canvas.width / 2, canvas.height / 2);
        return;
      }

      // Clear & Draw Road
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road background (perspective asphalt)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(canvas.width - 80, 0);
      ctx.lineTo(canvas.width - 20, canvas.height);
      ctx.lineTo(20, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Road boundary lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dashed lane dividers
      const laneWidth = (canvas.width - 100) / 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 12]);

      for (let l = 1; l < 3; l++) {
        const lx = 70 + l * laneWidth;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset dash

      // Draw each simulated vehicle with bounding boxes & DeepSORT vector lines
      vehicles.forEach((v) => {
        // Update vehicle motion
        v.y += v.speed * (v.isWrongWay ? -1 : 1);
        if (v.y > canvas.height + 40) v.y = -40;
        if (v.y < -50) v.y = canvas.height + 20;

        const xPos = 60 + (v.lane - 0.5) * laneWidth;
        const w = v.type === 'Bus' ? 36 : (v.type === 'Bike' ? 16 : 28);
        const h = v.type === 'Bus' ? 64 : (v.type === 'Bike' ? 24 : 44);

        const isHazard = v.risk > 60 || v.isWrongWay;
        const strokeColor = isHazard ? '#ef4444' : (v.risk > 30 ? '#f59e0b' : '#06b6d4');
        const fillColor = isHazard ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.1)';

        // Vehicle Chassis
        ctx.fillStyle = isHazard ? '#7f1d1d' : '#334155';
        ctx.fillRect(xPos - w / 2, v.y - h / 2, w, h);

        // Bounding Box (YOLOv8 style)
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHazard ? 2 : 1.5;
        ctx.strokeRect(xPos - w / 2 - 4, v.y - h / 2 - 4, w + 8, h + 8);

        // Corner brackets
        const b = 6;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(xPos - w / 2 - 4, v.y - h / 2 - 4 + b);
        ctx.lineTo(xPos - w / 2 - 4, v.y - h / 2 - 4);
        ctx.lineTo(xPos - w / 2 - 4 + b, v.y - h / 2 - 4);
        // Bottom-right
        ctx.moveTo(xPos + w / 2 + 4, v.y + h / 2 + 4 - b);
        ctx.lineTo(xPos + w / 2 + 4, v.y + h / 2 + 4);
        ctx.lineTo(xPos + w / 2 + 4 - b, v.y + h / 2 + 4);
        ctx.stroke();

        // Direction Vector / Trajectory Trail
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.moveTo(xPos, v.y);
        ctx.lineTo(xPos, v.y + (v.isWrongWay ? 25 : -25));
        ctx.stroke();

        // Tag label (ID, Speed, Risk)
        ctx.fillStyle = strokeColor;
        ctx.fillRect(xPos - w / 2 - 4, v.y - h / 2 - 20, w + 44, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(`${v.id} ${v.baseSpeed}km/h ${v.risk}%`, xPos - w / 2 - 1, v.y - h / 2 - 8);

        if (v.isWrongWay) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('WRONG-WAY', xPos - w / 2 - 1, v.y + h / 2 + 18);
        }
      });

      // HUD & CCTV Overlays
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 10, 190, 48);
      ctx.fillStyle = '#06b6d4';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`CAM: ${cameraId} • ${cameraName.substring(0, 16)}`, 18, 26);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`REC: ${new Date().toLocaleTimeString()} • 30 FPS`, 18, 40);
      ctx.fillText(`VEHICLES: ${vehicleCount} • RES: 1080p`, 18, 52);

      // Radar scanline
      const scanY = (time / 8) % canvas.height;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [isMonitored, riskLevel, cameraId, cameraName, vehicleCount]);

  const captureSnapshot = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL('image/png');
      setCapturedSnapshot(data);
      // Auto dismiss preview after 3s
      setTimeout(() => setCapturedSnapshot(null), 3000);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0c121e] group shadow-xl">
      {/* CCTV Viewport Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={270}
        className="w-full h-auto object-cover block"
      />

      {/* Snapshot Preview Toast */}
      {capturedSnapshot && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-20 animate-fade-in">
          <p className="text-xs font-mono font-bold text-emerald-400 mb-2">📸 FRAME CAPTURED & LOGGED</p>
          <img src={capturedSnapshot} alt="Captured" className="w-48 h-auto border border-emerald-500 rounded" />
        </div>
      )}

      {/* Top badges */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          REC
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-mono border border-slate-700">
          AI YOLOv8
        </span>
      </div>

      {/* Bottom control bar */}
      <div className="p-3 bg-[#0f172a]/95 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200">{cameraName}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 font-bold' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {riskLevel} RISK
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={captureSnapshot}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title="Capture Frame"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCanvas;
