'use client';

import { Share2, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareToWhatsApp = () => {
    try {
      const text = encodeURIComponent(`${title} - ${url}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } catch (error) {
      console.error('Failed to share to WhatsApp:', error);
    }
  };

  const shareToFacebook = () => {
    try {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } catch (error) {
      console.error('Failed to share to Facebook:', error);
    }
  };

  const shareToTwitter = () => {
    try {
      const text = encodeURIComponent(title);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
    } catch (error) {
      console.error('Failed to share to Twitter:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Link berhasil disalin!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link berhasil disalin!');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Gagal menyalin link');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={shareToWhatsApp}
        className="flex items-center space-x-1"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareToFacebook}
        className="flex items-center space-x-1"
      >
        <Facebook className="w-4 h-4" />
        <span>Facebook</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="flex items-center space-x-1"
      >
        <Twitter className="w-4 h-4" />
        <span>Twitter</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="flex items-center space-x-1"
      >
        <Share2 className="w-4 h-4" />
        <span>Salin</span>
      </Button>
    </div>
  );
}
    </div>
  );
}
