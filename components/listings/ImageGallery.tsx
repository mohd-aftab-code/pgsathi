"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface Photo {
  url: string;
  caption?: string | null;
}

export default function ImageGallery({ photos, title }: { photos: Photo[], title: string }) {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackImg = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";
  const displayPhotos = photos.length > 0 ? photos : [{ url: fallbackImg }];

  // Client-safe Cloudinary URL transformer
  const getThumbnailUrl = (url: string, width: number, height: number) => {
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,q_auto,f_webp/`);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "auto";
  };

  const nextPhoto = () => setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
  const prevPhoto = () => setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);

  return (
    <>
      {/* Grid Layout */}
      <div className="relative rounded-3xl overflow-hidden mb-8 h-[300px] sm:h-[400px] md:h-[500px] group">
        <div className={`grid h-full gap-2 ${displayPhotos.length >= 5 ? "grid-cols-2" : displayPhotos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {/* Main big image on left */}
          <div 
            className="relative cursor-pointer overflow-hidden h-full"
            onClick={() => openModal(0)}
          >
            <img 
              src={getThumbnailUrl(displayPhotos[0].url, 1200, 800)} 
              alt={`${title} - 1`} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          </div>

          {/* Right side grid */}
          {displayPhotos.length > 1 && (
            <div className={`grid gap-2 ${displayPhotos.length >= 5 ? "grid-cols-2 grid-rows-2" : displayPhotos.length === 2 ? "grid-cols-1 grid-rows-1" : "grid-cols-1 grid-rows-2"}`}>
              {displayPhotos.slice(1, 5).map((photo, i) => (
                <div 
                  key={i} 
                  className="relative cursor-pointer overflow-hidden h-full hidden sm:block"
                  onClick={() => openModal(i + 1)}
                >
                  <img 
                    src={getThumbnailUrl(photo.url, 600, 400)} 
                    alt={`${title} - ${i + 2}`} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                  {/* Overlay for the 5th photo showing "+X more" */}
                  {i === 3 && displayPhotos.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">+{displayPhotos.length - 5} More</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View all button overlay */}
        <button 
          onClick={() => openModal(0)}
          className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-neutral-800 shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
        >
          <ImageIcon size={16} /> Show all photos
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <button 
            onClick={prevPhoto}
            className="absolute left-4 md:left-12 text-white/70 hover:text-white bg-white/10 p-3 rounded-full transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-5xl w-full max-h-[85vh] px-4 md:px-0 flex flex-col items-center">
            <img 
              src={displayPhotos[currentIndex].url} 
              alt={`${title} - ${currentIndex + 1}`} 
              className="max-w-full max-h-[80vh] object-contain select-none" 
            />
            <div className="text-white/70 mt-4 font-medium text-sm">
              {currentIndex + 1} / {displayPhotos.length}
              {displayPhotos[currentIndex].caption && <span className="ml-4">{displayPhotos[currentIndex].caption}</span>}
            </div>
          </div>

          <button 
            onClick={nextPhoto}
            className="absolute right-4 md:right-12 text-white/70 hover:text-white bg-white/10 p-3 rounded-full transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
