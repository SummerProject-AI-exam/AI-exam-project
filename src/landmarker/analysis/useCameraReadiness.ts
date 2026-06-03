
export type CameraStatus = {
  permission: "allowed" | "blocked" | "error";
  stream: "active" | "inactive" | "error";
  image: "ok" | "black" | "frozen" | "error";
  errorMessage?: string;
};

export async function checkCameraReadiness(): Promise<CameraStatus> {
  const status: CameraStatus = {
    permission: "error",
    stream: "inactive",
    image: "error",
    errorMessage: undefined,
  };

  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    status.permission = "allowed";
  } catch (err: any) {
    if (err.name === "NotAllowedError") {
      status.permission = "blocked";
      status.errorMessage = "Camera permission was denied.";
    } else if (err.name === "NotFoundError") {
      status.errorMessage = "No camera device found.";
    } else if (err.name === "NotReadableError") {
      status.errorMessage = "Camera is in use by another application.";
    } else if (err.name === "OverconstrainedError") {
      status.errorMessage = "Camera constraints cannot be satisfied.";
    } else if (err.name === "SecurityError") {
      status.errorMessage = "Browser blocked camera access.";
    } else {
      status.errorMessage = "Unknown camera error.";
    }
    return status;
  }

  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) {
    status.stream = "error";
    status.errorMessage = "No video track found.";
    return status;
  }

  status.stream = "active";

  
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  await video.play().catch(() => {
    status.stream = "error";
    status.errorMessage = "Camera stream could not start.";
    return status;
  });

  
  if (videoTrack.readyState !== "live") {
    status.stream = "error";
    status.errorMessage = "Camera is not delivering frames.";
    return status;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 320;
  canvas.height = 240;

  await new Promise((res) => setTimeout(res, 300));

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let sum = 0;
  for (let i = 0; i < frame.length; i += 4) {
    const r = frame[i];
    const g = frame[i + 1];
    const b = frame[i + 2];
    sum += (r + g + b) / 3;
  }
  const avgBrightness = sum / (frame.length / 4);

  if (avgBrightness < 10) {
    status.image = "black";
    status.errorMessage = "Camera image is completely dark.";
    return status;
  }

  await new Promise((res) => setTimeout(res, 300));
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const frame2 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let diff = 0;
  for (let i = 0; i < frame.length; i += 4) {
    diff += Math.abs(frame[i] - frame2[i]);
  }

  if (diff < 50) {
    status.image = "frozen";
    status.errorMessage = "Camera image appears frozen.";
    return status;
  }

  status.image = "ok";
  return status;
}
