import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop (Grey overlay, full screen)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose} // Allows closing modal by clicking outside
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-11/12 max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()} // Prevents click inside from closing the modal
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black text-2xl"
            aria-label="Close modal"
          >
            &times; {/* HTML multiplication sign for an 'X' close button */}
          </button>
        </div>

        {/* Modal Body (Content) */}
        <div className="text-gray-700">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Modal;