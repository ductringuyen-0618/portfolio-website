interface VideoPreviewProps {
  title?: string;
  onClick?: () => void;
  className?: string;
}

export default function VideoPreview({ title, onClick, className }: VideoPreviewProps) {
  return (
    <div 
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className || ''}`}
      onClick={onClick}
      title={title}
    >
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-7a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">{title || 'Video Demo'}</p>
        <p className="text-xs text-gray-400 mt-1">Click to play</p>
      </div>
    </div>
  );
}
