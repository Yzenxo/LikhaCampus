import { Image, Upload, Video, X } from "lucide-react";
import { useState } from "react";

const ProjectUploader = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const MAX_FILES = 4;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setError("");

    if (files.length + selected.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files total.`);
      return;
    }

    const currentVideoCount = files.filter((f) =>
      f.file.type.startsWith("video/")
    ).length;

    const validFiles = [];
    for (const file of selected) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        setError("Only images and videos are allowed.");
        return;
      }

      if (isVideo && currentVideoCount >= 1) {
        setError("You can only upload 1 video per project.");
        return;
      }

      if (isVideo && files.length + validFiles.length >= MAX_FILES) {
        setError(
          "You can upload 1 video + 3 images OR 4 images (max 4 media files)."
        );
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError(`Image "${file.name}" exceeds 5MB limit.`);
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError(`Video "${file.name}" exceeds 20MB limit.`);
        console.log("Video too large");
        return;
      }

      const fileObj = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      };
      validFiles.push(fileObj);
    }

    const updated = [...files, ...validFiles];
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const removeFile = (id) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const videoCount = files.filter((f) => f.type === "video").length;
  const imageCount = files.filter((f) => f.type === "image").length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* FILE INPUT */}
        <div className="border-2 border-dashed border-base-300 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Upload className="w-6 h-6 opacity-60 mb-2" />
          <p className="font-medium">Drop or select images/videos</p>
          <p className="text-xs text-muted mt-1">
            Max 4 files: 1 video (20MB) + 3 images (5MB each) OR 4 images
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="file-input file-input-bordered mt-3 w-full max-w-xs"
            disabled={files.length >= MAX_FILES}
          />

          {/* FILE COUNT INDICATOR */}
          <div className="text-xs text-muted mt-2">
            {videoCount > 0 && <span>🎥 {videoCount} video • </span>}
            {imageCount > 0 && <span>🖼️ {imageCount} image(s) • </span>}
            <span className={files.length >= MAX_FILES ? "text-warning" : ""}>
              {files.length}/{MAX_FILES} files
            </span>
          </div>

          {error && (
            <div className="alert alert-error mt-3 text-sm">
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* PREVIEW */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((f) => (
              <div
                key={f.id}
                className="relative rounded-md overflow-hidden border border-base-300"
              >
                {f.type === "image" ? (
                  <div className="relative">
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      {(f.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={f.preview}
                      className="w-full h-32 object-cover"
                      muted
                    />
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {(f.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeFile(f.id)}
                  className="btn btn-xs btn-circle btn-error absolute top-1 right-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectUploader;
