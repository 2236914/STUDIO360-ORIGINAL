'use client';

import { useEffect } from 'react';
import { storefrontApi } from 'src/utils/api/storefront';
import { getCurrentStoreId } from 'src/utils/subdomain';

// ----------------------------------------------------------------------

/**
 * Component to dynamically update the favicon based on store profile image
 */
export function StoreFavicon({ storeId: propStoreId }) {
  useEffect(() => {
    const updateFavicon = async () => {
      // Get store ID from prop or current URL
      let currentStoreId = propStoreId;
      
      if (!currentStoreId && typeof window !== 'undefined') {
        // Try to get from current URL/subdomain
        currentStoreId = getCurrentStoreId();
        
        // Special case: kitschstudio.page domain
        const hostname = window.location.hostname;
        if ((hostname === 'kitschstudio.page' || hostname === 'www.kitschstudio.page') && !currentStoreId) {
          currentStoreId = 'kitschstudio';
        }
      }

      if (!currentStoreId) return;

      try {
        // Fetch shop info to get profile photo
        const resp = await storefrontApi.getShopInfo(currentStoreId);
        const data = resp?.data || resp;
        const profilePhotoUrl = data?.profile_photo_url;

        if (!profilePhotoUrl) {
          // If no profile photo, keep default favicon
          return;
        }

        // Find existing favicon link or create new one
        let faviconLink = document.querySelector("link[rel~='icon']") || 
                         document.querySelector("link[rel*='shortcut']") ||
                         document.querySelector("link[rel='icon']");

        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }

        // Create a canvas to convert the image to a favicon
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              // Fallback: use the profile photo URL directly
              faviconLink.href = profilePhotoUrl;
              return;
            }
            
            // Draw white background first (for better visibility)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 32, 32);
            
            // Draw image as circle
            ctx.beginPath();
            ctx.arc(16, 16, 15, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 0, 0, 32, 32);
            
            // Convert to favicon data URL
            const faviconUrl = canvas.toDataURL('image/png');
            faviconLink.href = faviconUrl;
            faviconLink.type = 'image/png';
          } catch (err) {
            console.error('Error creating favicon from image:', err);
            // Fallback: use the profile photo URL directly
            faviconLink.href = profilePhotoUrl;
          }
        };

        img.onerror = () => {
          console.error('Error loading profile photo for favicon');
        };

        img.src = profilePhotoUrl;
      } catch (err) {
        console.error('Error fetching shop info for favicon:', err);
      }
    };

    updateFavicon();
  }, [propStoreId]);

  return null; // This component doesn't render anything
}

