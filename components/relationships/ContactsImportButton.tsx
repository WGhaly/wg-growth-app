'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import { createPerson } from '@/actions/relationships';

interface Contact {
  name?: string[];
  tel?: string[];
  email?: string[];
}

export function ContactsImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only check support on client-side
    setIsClient(true);
    if (typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleImportContacts = async () => {
    // Check if Contact Picker API is supported
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      setMessage({
        type: 'error',
        text: 'Contact picker is not supported on this device. This feature requires iOS 14+ Safari or Chrome 80+.'
      });
      setIsSupported(false);
      return;
    }

    try {
      setIsImporting(true);
      setMessage(null);

      // Request contacts from the user's device
      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };

      // @ts-ignore - Contact Picker API types
      const contacts = await navigator.contacts.select(props, opts);

      if (!contacts || contacts.length === 0) {
        setMessage({ type: 'error', text: 'No contacts selected' });
        return;
      }

      let imported = 0;
      let failed = 0;

      // Import each contact
      for (const contact of contacts as Contact[]) {
        try {
          // Parse name
          const fullName = contact.name?.[0] || 'Unknown';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || undefined;

          // Get phone and email
          const phoneNumber = contact.tel?.[0] || undefined;
          const email = contact.email?.[0] || undefined;

          // Create person with default values
          const result = await createPerson({
            firstName,
            lastName,
            relationshipType: 'friend', // Default type
            circle: 'outer', // Default to outer circle
            trustLevel: 'medium', // Default trust level
            phoneNumber,
            email,
            notes: 'Imported from contacts'
          });

          if (result.success) {
            imported++;
          } else {
            failed++;
            console.error('Failed to import contact:', fullName, result.error);
          }
        } catch (error) {
          failed++;
          console.error('Error importing contact:', error);
        }
      }

      if (imported > 0) {
        setMessage({
          type: 'success',
          text: `Successfully imported ${imported} contact${imported > 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : '.'} Please review and update their details.`
        });
        
        // Refresh the page to show new contacts
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: `Failed to import contacts. ${failed} contact${failed > 1 ? 's' : ''} could not be imported.`
        });
      }
    } catch (error: any) {
      console.error('Contact picker error:', error);
      
      let errorMessage = 'Failed to import contacts';
      if (error.name === 'InvalidStateError') {
        errorMessage = 'Contact picker is not available. Please ensure you\'re using a supported browser.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Contact access requires a secure connection (HTTPS).';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsImporting(false);
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-3">
        <Button
          disabled
          variant="secondary"
          fullWidth
        >
          <UserPlus size={18} className="mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleImportContacts}
        disabled={isImporting || !isSupported}
        variant="secondary"
        fullWidth
      >
        <UserPlus size={18} className="mr-2" />
        {isImporting ? 'Importing...' : 'Import from Contacts'}
      </Button>

      {message && (
        <Alert
          variant={message.type === 'error' ? 'error' : 'success'}
          onClose={() => setMessage(null)}
        >
          {message.type === 'error' && <AlertCircle size={16} className="mr-2" />}
          {message.text}
        </Alert>
      )}

      {!isSupported && (
        <p className="text-xs text-text-tertiary text-center">
          Contact picker requires iOS 14+ Safari, Chrome 80+, or Edge 80+
        </p>
      )}
    </div>
  );
}
