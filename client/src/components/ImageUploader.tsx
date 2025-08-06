import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image, Check, AlertCircle, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onComplete?: (imageUrl: string, altText?: string) => void;
  buttonClassName?: string;
  children: React.ReactNode;
  requireAltText?: boolean;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

interface ImageValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function ImageUploader({
  onComplete,
  buttonClassName,
  children,
  requireAltText = true,
  maxSizeInMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [validation, setValidation] = useState<ImageValidation>({ isValid: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): ImageValidation => {
    const warnings: string[] = [];
    
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Please select: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSizeInMB}MB`
      };
    }

    // Performance warnings
    if (file.size > 2 * 1024 * 1024) { // > 2MB
      warnings.push('Large file detected. Consider optimizing for better performance.');
    }

    if (!file.type.includes('webp') && file.size > 500 * 1024) { // > 500KB and not WebP
      warnings.push('Consider converting to WebP format for better compression.');
    }

    return { isValid: true, warnings };
  }, [acceptedFormats, maxSizeInMB]);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    setValidation(validation);

    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (validation.warnings && validation.warnings.length > 0) {
      toast({
        title: "File Warnings",
        description: validation.warnings.join(' '),
        variant: "default",
      });
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-generate alt text suggestion based on filename
    const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const suggested = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (!altText) {
      setAltText(suggested);
    }
  }, [validateFile, altText, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const canUpload = () => {
    if (!selectedFile || uploading) return false;
    if (requireAltText && !altText.trim()) return false;
    return validation.isValid;
  };

  const handleUpload = async () => {
    if (!canUpload()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('image', selectedFile!);
      formData.append('altText', altText.trim());

      setUploadProgress(25);

      // Upload to backend with retry logic
      let response: Response;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) break;

          attempts++;
          if (attempts === maxAttempts) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Upload failed: ${response.status}`);
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      setUploadProgress(75);

      const { imageUrl } = await response!.json();
      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: "Your image has been uploaded and optimized!",
      });

      onComplete?.(imageUrl, altText.trim());
      handleClose();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(resetModal, 300);
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setAltText('');
    setUploadProgress(0);
    setUploading(false);
    setValidation({ isValid: true });
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className={buttonClassName}
        disabled={uploading}
        type="button"
      >
        {children}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !uploading) {
          handleClose();
        }
      }}>
        <DialogContent className="sm:max-w-lg" aria-describedby="upload-dialog-description">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription id="upload-dialog-description">
              Select an image file to upload. {requireAltText && 'Alt text is required for accessibility.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.02]' 
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeInMB}MB
                </p>
                {acceptedFormats.includes('image/webp') && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    WebP format recommended for best performance
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                {preview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-w-full max-h-48 object-contain rounded-lg border shadow-sm"
                      />
                      {validation.warnings && validation.warnings.length > 0 && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-yellow-100 dark:bg-yellow-900 p-1 rounded-full" title={validation.warnings.join(' ')}>
                            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* File Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileImage className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={resetModal}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Alt Text Input */}
                {requireAltText && (
                  <div className="space-y-2">
                    <Label htmlFor="alt-text" className="text-sm font-medium">
                      Alt Text <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="alt-text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe this image for accessibility"
                      disabled={uploading}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Describe the image content for screen readers and SEO
                    </p>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Uploading and optimizing... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Validation Warnings */}
                {validation.warnings && validation.warnings.length > 0 && !uploading && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        {validation.warnings.map((warning, index) => (
                          <p key={index}>{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!canUpload()}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Choose Different
                  </Button>
                </div>

                {/* Upload Requirements */}
                {requireAltText && !altText.trim() && (
                  <p className="text-xs text-red-500 text-center">
                    Alt text is required before uploading
                  </p>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                // Reset input so same file can be selected again
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}